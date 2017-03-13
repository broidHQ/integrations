import * as Promise from "bluebird";
import * as botbuilder from "botbuilder";
import broidSchemas from "broid-schemas";
import { Logger } from "broid-utils";
import * as mimetype from "mimetype";
import * as uuid from "node-uuid";
import * as R from "ramda";
import { Observable } from "rxjs/Rx";

import { IAdapterHTTPOptions, IAdapterOptions } from "./interfaces";
import Parser from "./parser";
import WebHookServer from "./webHookServer";

export default class Adapter {
  private connected: boolean;
  private HTTPOptions: IAdapterHTTPOptions;
  private logLevel: string;
  private logger: Logger;
  private parser: Parser;
  private serviceID: string;
  private storeUsers: Map<string, Object>;
  private storeAddresses: Map<string, Object>;
  private token: string | null;
  private tokenSecret: string | null;
  private webhookServer: WebHookServer;
  private session: botbuilder.UniversalBot;
  private sessionConnector: botbuilder.ChatConnector;

  constructor(obj?: IAdapterOptions) {
    this.serviceID = obj && obj.serviceID || uuid.v4();
    this.logLevel = obj && obj.logLevel || "info";
    this.token = obj && obj.token || null;
    this.tokenSecret = obj && obj.tokenSecret || null;
    this.storeUsers = new Map();
    this.storeAddresses = new Map();

    const HTTPOptions: IAdapterHTTPOptions = {
      host: "127.0.0.1",
      port: 8080,
    };
    this.HTTPOptions = obj && obj.http || HTTPOptions;
    this.HTTPOptions.host = this.HTTPOptions.host || HTTPOptions.host;
    this.HTTPOptions.port = this.HTTPOptions.port || HTTPOptions.port;

    this.parser = new Parser(this.serviceID, this.logLevel);
    this.logger = new Logger("adapter", this.logLevel);
  }

  // Return list of users information
  public users(): Promise {
    return Promise.resolve(this.storeUsers);
  }

  // Return list of channels information
  public channels(): Promise {
    return Promise.reject(new Error("Not supported"));
  }

  public addresses(id) {
    if (this.storeAddresses.get(id)) {
      return Promise.resolve(this.storeAddresses.get(id));
    }

    return Promise.reject(new Error(`Address ${id} not found`));
  }

  // Return the service ID of the current instance
  public serviceId(): String {
    return this.serviceID;
  }

  // Connect to Skype
  // Start the webhook server
  public connect(): Observable<Object> {
    if (this.connected) {
      return Observable.of({ type: "connected", serviceID: this.serviceId() });
    }

    if (!this.token
      || !this.tokenSecret) {
      return Observable.throw(new Error("Credentials should exist."));
    }

    this.sessionConnector = new botbuilder.ChatConnector({
      appId: this.token,
      appPassword: this.tokenSecret,
    });

    this.session = new botbuilder.UniversalBot(this.sessionConnector);
    this.connected = true;

    this.webhookServer = new WebHookServer(this.HTTPOptions, this.logLevel);
    this.webhookServer.route(this.sessionConnector.listen());
    this.webhookServer.listen();

    return Observable.of({ type: "connected", serviceID: this.serviceId() });
  }

  public disconnect(): Promise {
    return Promise.reject(new Error("Not supported"));
  }

  // Listen "message" event from Messenger
  public listen(): Observable<Object> {
    return Observable.create((observer) => {
      this.session.dialog("/", (event) => {
        this.storeAddresses.set(R.path([
          "message",
          "address",
          "id",
        ], event), R.path(["message", "address"], event));
        this.storeUsers.set(R.path([
          "message",
          "user",
          "id",
        ], event), R.path(["message", "user"], event));

        return Promise.resolve(event.message)
          .then((normalized) => this.parser.parse(normalized))
          .then((parsed) => this.parser.validate(parsed))
          .then((validated) => {
            if (validated) { return observer.next(validated); }
            return null;
          })
          .catch((error) => this.logger.error(error));
      });
    });
  }

  public send(data: Object): Promise {
    this.logger.debug("sending", { message: data });
    return broidSchemas(data, "send")
      .then(() => {
        const context = R.path(["object", "context", "content"], data);
        const content = R.path(["object", "content"], data);
        const name = R.path(["object", "name"], data);
        const type = R.path(["object", "type"], data);
        const contextArr = R.split("#", context);
        const addressID = contextArr[0];

        let address = this.storeAddresses.get(addressID);
        if (!address) {
          if (R.length(contextArr) !== 4) {
            return Promise
              .reject(new Error("Context value should use the form: address.id#address.conversation.id#channelId#bot.id"));
          }

          const conversationID = contextArr[1];
          const channelID = contextArr[2];
          const botID = contextArr[3];
          const userID = R.path(["to", "id"], data);

          address = {
            bot: {
              id: botID,
            },
            channelId: channelID,
            conversation: {
              id: conversationID,
            },
            id: addressID,
            serviceUrl: `https://${channelID}.botframework.com`,
            useAuth: true,
            user: {
              id: userID,
            },
          };
        }

        // Process attachment
        const attachmentButtons = R.filter((attachment) =>
          attachment.type === "Button",
          R.path(["object", "attachment"], data) || []);

        const messageButtons = R.map((button) => {
          return new botbuilder.CardAction()
            .type("imBack")
            .value(button.url)
            .title(button.name || button.content || "Click to send response to bot");
        }, attachmentButtons);

        let messageAttachments: any[] = [];
        const messageBuilder = new botbuilder.Message()
          .textFormat(botbuilder.TextFormat.markdown)
          .address(address as botbuilder.IAddress);

        if (type === "Note") {
          if (!messageButtons) {
            messageBuilder.text(content);
          } else {
            messageAttachments = [
              new botbuilder.HeroCard()
                .title(name)
                .text(content)
                .buttons(messageButtons),
            ];
          }
        } else if (type === "Image" || type === "Video") {
          const url = R.path(["object", "url"], data);
          const hero = new botbuilder.HeroCard()
            .title(name)
            .text(content);

          if (messageButtons) {
            hero.buttons(messageButtons);
          }

          if (type === "Image") {
            hero.images([new botbuilder.CardImage().url(url)]);
            messageAttachments = [hero];
          } else {
            messageAttachments = [{
              contentType: mimetype.lookup(url),
              contentUrl: url,
            }, hero];
          }
        }

        if (type === "Note" || type === "Image" || type === "Video") {
          messageBuilder.attachments(messageAttachments);
          return Promise.fromCallback((cb) => this.session.send(messageBuilder, cb))
            .then(() => ({ serviceID: this.serviceId(), type: "sent" }));
        }

        return Promise.reject(new Error("Only Note, Image, and Video are supported."));
      });
  }
}
