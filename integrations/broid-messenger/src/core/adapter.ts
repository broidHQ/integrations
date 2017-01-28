import * as Promise from "bluebird";
import broidSchemas from "broid-schemas";
import { concat, Logger } from "broid-utils";
import * as uuid from "node-uuid";
import * as R from "ramda";
import * as rp from "request-promise";
import { Observable } from "rxjs/Rx";

import { IAdapterHTTPOptions, IAdapterOptions, IWebHookEvent } from "./interfaces";
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
  private token: string | null;
  private tokenSecret: string | null;
  private webhookServer: WebHookServer;

  constructor(obj?: IAdapterOptions) {
    this.serviceID = obj && obj.serviceID || uuid.v4();
    this.logLevel = obj && obj.logLevel || "info";
    this.token = obj && obj.token || null;
    this.tokenSecret = obj && obj.tokenSecret || null;
    this.storeUsers = new Map();

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

  // Return the service ID of the current instance
  public serviceId(): String {
    return this.serviceID;
  }

  // Connect to Messenger
  // Start the webhook server
  public connect(): Observable<Object> {
    if (this.connected) {
      return Observable.of({ type: "connected", serviceID: this.serviceId() });
    }

    if (!this.token
      || !this.tokenSecret) {
      return Observable.throw(new Error("Credentials should exist."));
    }

    this.connected = true;

    this.webhookServer = new WebHookServer(this.tokenSecret, this.HTTPOptions,
      this.logLevel);
    this.webhookServer.listen();

    return Observable.of({ type: "connected", serviceID: this.serviceId() });
  }

  public disconnect(): Promise {
    return Promise.reject(new Error("Not supported"));
  }

  // Listen "message" event from Messenger
  public listen(): Observable<Object> {
    return Observable.fromEvent(this.webhookServer, "message")
      .mergeMap((event: IWebHookEvent) => this.parser.normalize(event))
      .mergeMap((messages: any) => Observable.from(messages))
      .mergeMap((message: any) => this.user(message.author)
        .then((author) => {
          message.authorInformation = author;
          return message;
      }))
      .mergeMap((normalized) => this.parser.parse(normalized))
      .mergeMap((parsed) => this.parser.validate(parsed))
      .mergeMap((validated) => {
        if (!validated) { return Observable.empty(); }
        return Promise.resolve(validated);
      });
  }

  public send(data: Object): Promise {
    this.logger.debug("sending", { message: data });
    return broidSchemas(data, "send")
      .then(() => {
        const toID: string = R.path(["to", "id"], data)
          || R.path(["to", "name"], data);
        const type: string = R.path(["object", "type"], data);
        const content: string = R.path(["object", "content"], data);
        const name: string = R.path(["object", "name"], data) || content;

        const attachments = R.path(["object", "attachment"], data) || [];
        const buttons = R.filter((attachment) =>
          attachment.type === "Button", attachments);

        let fButtons = R.map((button) => {
          // facebook type: postback, element_share
          if (!button.mediaType) {
            return {
              payload: button.url,
              title: button.name,
              type: "postback",
            };
          } else if (button.mediaType === "text/html") {
            // facebook type: web_url, account_link
            return {
              title: button.name,
              type: "web_url",
              url: button.url,
            };
          } else if (button.mediaType === "audio/telephone-event") {
            // facebook type: phone_number
            return {
              payload: button.url,
              title: button.name,
              type: "phone_number",
            };
          }

          return null;
        }, buttons);
        fButtons = R.reject(R.isNil)(fButtons);

        const messageData = {
          message: {
            attachment: {},
            text: "",
          },
          recipient: { id: toID },
        };

        if (type === "Image") {
          const attachment = {
            payload: {
              elements: [{
                buttons: !R.isEmpty(fButtons) ? fButtons : null,
                image_url: R.path(["object", "url"], data),
                item_url: "",
                subtitle: content !== name ? content : "",
                title: name || "",
              }],
              template_type: "generic",
            },
            type: "template",
          };
          messageData.message.attachment = attachment;
        } else if (type === "Video") {
          if (!R.isEmpty(fButtons)) {
            const attachment = {
              payload: {
                elements: [{
                  buttons: fButtons,
                  image_url: R.path(["object", "url"], data),
                  item_url: "",
                  subtitle: content !== name ? content : "",
                  title: name || "",
                }],
                template_type: "generic",
              },
              type: "template",
            };
            messageData.message.attachment = attachment;
          } else {
            messageData.message.text = concat([
              R.path(["object", "name"], data) || "",
              R.path(["object", "content"], data) || "",
              R.path(["object", "url"], data),
            ]);
          }
        } else if (type === "Note") {
          if (!R.isEmpty(fButtons)) {
            const attachment = {
              payload: {
                elements: [{
                  buttons: fButtons,
                  image_url: "",
                  item_url: "",
                  subtitle: content || "",
                  title: name || "",
                }],
                template_type: "generic",
              },
              type: "template",
            };
            messageData.message.attachment = attachment;
          } else {
            messageData.message.text = R.path(["object", "content"], data);
            delete messageData.message.attachment;
          }
        }

        if (type === "Note" || type === "Image" || type === "Video") {
          return rp({
            json: messageData,
            method: "POST",
            qs: { access_token: this.token },
            uri: "https://graph.facebook.com/v2.8/me/messages",
          })
          .then(() => ({ type: "sended", serviceID: this.serviceId() }));
        }

        return Promise.reject(new Error("Only Note, Image, and Video are supported."));
      });
  }

  // Return user information
  private user(id: string, fields: string = "name,first_name,last_name", cache: boolean = true): Promise {
    const key: string = `${id}${fields}`;
    if (cache && this.storeUsers.get(key)) {
      const data = this.storeUsers.get(key);
      return Promise.resolve(data);
    }

    return rp({
      json: true,
      method: "GET",
      qs: { access_token: this.token, fields },
      uri: `https://graph.facebook.com/v2.8/${id}`,
    })
    .then((data) => {
      this.storeUsers.set(key, data);
      return data;
    });
  }
}
