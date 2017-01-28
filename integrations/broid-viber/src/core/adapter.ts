import * as Promise from "bluebird";
import broidSchemas from "broid-schemas";
import { Logger } from "broid-utils";
import * as http from "http";
import * as uuid from "node-uuid";
import * as R from "ramda";
import { Observable } from "rxjs/Rx";
import { Bot, Events, Message } from "viber-bot";

import { IAdapterHTTPOptions, IAdapterOptions } from "./interfaces";
import Parser from "./parser";

export default class Adapter {
  private avatar: string;
  private connected: boolean;
  private HTTPOptions: IAdapterHTTPOptions;
  private logger: Logger;
  private logLevel: string;
  private me: any;
  private parser: Parser;
  private serviceID: string;
  private session: any;
  private storeUsers: Map<string, any>;
  private token: string | null;
  private username: string | null;
  private webhookServer: http.Server;

  constructor(obj?: IAdapterOptions) {
    this.serviceID = obj && obj.serviceID || uuid.v4();
    this.logLevel = obj && obj.logLevel || "info";
    this.token = obj && obj.token || null;
    this.username = obj && obj.username || null;
    this.avatar = obj && obj.avatar || "";

    const HTTPOptions: IAdapterHTTPOptions = {
      host: "127.0.0.1",
      port: 8080,
      webhookURL: "http://127.0.0.1/",
    };
    this.HTTPOptions = obj && obj.http || HTTPOptions;
    this.HTTPOptions.host = this.HTTPOptions.host || HTTPOptions.host;
    this.HTTPOptions.port = this.HTTPOptions.port || HTTPOptions.port;
    this.HTTPOptions.webhookURL = this.HTTPOptions.webhookURL || HTTPOptions.webhookURL;
    this.HTTPOptions.webhookURL = this.HTTPOptions.webhookURL
      .replace(/\/?$/, "/");

    this.storeUsers = new Map();
    this.parser = new Parser(this.serviceID, this.logLevel);
    this.logger = new Logger("adapter", this.logLevel);
  }

  // Return list of users information
  public users(): Promise<Map<string, any>> {
    return Promise.reject(this.storeUsers);
  }

  // Return list of channels information
  public channels(): Promise<Error> {
    return Promise.reject(new Error("Not supported"));
  }

  // Return the service ID of the current instance
  public serviceId(): String {
    return this.serviceID;
  }

  // Connect to Callr
  // Start the webhook server
  public connect(): Observable<Object> {
    if (this.connected) {
      return Observable.of({ type: "connected", serviceID: this.serviceId() });
    }
    this.connected = true;

    if (!this.token
      || !this.username) {
      return Observable.throw(new Error("Credentials should exist."));
    }

    this.session = new Bot({
      authToken: this.token,
      avatar: this.avatar,
      name: this.username,
    });

    this.webhookServer = http.createServer(this.session.middleware())
      .listen(this.HTTPOptions.port, this.HTTPOptions.host, () =>
        this.session.setWebhook(this.HTTPOptions.webhookURL)
          .then(() =>
            this.logger.info(`Server listening at port ${this.HTTPOptions.host}:${this.HTTPOptions.port}...`))
          .catch((e: Error) => {
            this.logger.error(e);
            this.webhookServer.close();
          }));

    return Observable.of({ type: "connected", serviceID: this.serviceId() });
  }

  public disconnect(): Promise<Error> {
    return Promise.reject(new Error("Not supported"));
  }

  // Listen "message" event from Callr
  public listen(): Observable<Object> {
    if (!this.session) {
      return Observable.throw(new Error("No session found."));
    }

    return Observable.fromEvent(this.session, Events.MESSAGE_RECEIVED,
      (...args) => ({ message: args[0], user_profile: args[1].userProfile }))
      .mergeMap((event: any) => this.parser.normalize(event))
      .mergeMap((normalized: any) => {
        if (!normalized) { return Promise.resolve(null); }

        const id: any = R.path(["author", "id"], normalized);
        if (id) {
          this.storeUsers.set(id as string, normalized.author);
        }
        if (this.me) {
          normalized.target = this.me;
          return Promise.resolve(normalized);
        }

        return this.session.getBotProfile()
          .then((profile: any) => {
            this.me = R.assoc("_isMe", true, profile);
            normalized.target = this.me;
            return normalized;
          });
      })
      .mergeMap((normalized) => this.parser.parse(normalized))
      .mergeMap((parsed) => this.parser.validate(parsed))
      .mergeMap((validated) => {
        if (!validated) { return Observable.empty(); }
        return Promise.resolve(validated);
      });
  }

  public send(data: Object): Promise<any> {
    this.logger.debug("sending", { message: data });
    return broidSchemas(data, "send")
      .then(() => {
        if (R.path(["to", "type"], data) !== "Person") {
          return Promise.reject(new Error("Message to a Person is only supported."));
        }
        return data;
      })
      .then((message: any) => {
        const content = R.path(["object", "content"], message);
        const type = R.path(["object", "type"], message);

        const attachments: any = R.pathOr([], ["object", "attachment"], message);
        const attachmentsButtons = R.filter((attachment: any) =>
          attachment.type === "Button", attachments);

        let keyboard: any | null = null;
        if (attachmentsButtons && !R.isEmpty(attachmentsButtons)) {
          keyboard = {
            Buttons: R.map((attachment: any) => {
              let actionType: string = "reply";
              if (attachment.mediaType === "text/html") {
                actionType = "open-url";
              }

              return {
                ActionBody: attachment.url,
                ActionType: actionType,
                BgColor: "#2db9b9",
                Text: attachment.name || attachment.content,
              };
            }, attachmentsButtons),
            DefaultHeight: true,
            Type: "keyboard",
          };
        }

        if (type === "Note") {
          return [new Message.Text(content, keyboard), message];
        } else if (type === "Image" || type === "Video") {
          const url = R.path(["object", "url"], message);
          const preview = R.path(["object", "preview"], message);

          if (type === "Image") {
            return [new Message.Picture(url, content, preview, keyboard), message];
          } else {
            return [new Message.Video(url, null, preview, null, keyboard), message];
          }
        } else if (type === "Place") {
          const latitude = R.path(["object", "latitude"], message);
          const longitude = R.path(["object", "longitude"], message);
          return [new Message.Location(latitude, longitude, keyboard), message];
        }

        return [null, message];
      })
      .spread((messageBuilder: any, message: any) => {
        if (messageBuilder) {
          const toID = R.path(["to", "id"], message);
          return this.session.sendMessage({ id: toID }, messageBuilder)
            .then(() => ({ type: "sended", serviceID: this.serviceId() }));
        }

        return Promise.reject(new Error("Note, Image, Video are only supported."));
      });
  }
}
