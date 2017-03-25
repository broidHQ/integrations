import * as Promise from "bluebird";
import broidSchemas from "@broid/schemas";
import { Logger } from "@broid/utils";
import * as Nexmo from "nexmo";
import * as uuid from "node-uuid";
import * as R from "ramda";
import { Observable } from "rxjs/Rx";

import { IAdapterHTTPOptions, IAdapterOptions } from "./interfaces";
import Parser from "./parser";
import WebHookServer from "./webHookServer";

export default class Adapter {
  private serviceID: string;
  private username: string | null;
  private token: string | null;
  private tokenSecret: string | null;
  private HTTPOptions: IAdapterHTTPOptions;
  private connected: boolean;
  private parser: Parser;
  private logLevel: string;
  private logger: Logger;
  private webhookServer: WebHookServer;
  private session: any;

  constructor(obj?: IAdapterOptions) {
    this.serviceID = obj && obj.serviceID || uuid.v4();
    this.logLevel = obj && obj.logLevel || "info";
    this.token = obj && obj.token || null;
    this.tokenSecret = obj && obj.tokenSecret || null;
    this.username = obj && obj.username || null;

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
  public users(): Promise<Error> {
    return Promise.reject(new Error("Not supported"));
  }

  // Return list of channels information
  public channels(): Promise<Error> {
    return Promise.reject(new Error("Not supported"));
  }

  // Return the service ID of the current instance
  public serviceId(): String {
    return this.serviceID;
  }

  // Connect to Nexmo
  // Start the webhook server
  public connect(): Observable<Object> {
    if (this.connected) {
      return Observable.of({ type: "connected", serviceID: this.serviceId() });
    }
    this.connected = true;

    if (!this.token || this.token === "") {
      return Observable.throw(new Error("Token should exist."));
    }

    if (!this.tokenSecret || this.tokenSecret === "") {
      return Observable.throw(new Error("TokenSecret should exist."));
    }

    this.session = new Nexmo({
      apiKey: this.token,
      apiSecret: this.tokenSecret,
    });

    this.webhookServer = new WebHookServer(this.HTTPOptions, this.logLevel);
    this.webhookServer.listen();

    return Observable.of(({ type: "connected", serviceID: this.serviceId() }));
  }

  public disconnect(): Promise<Error> {
    return Promise.reject(new Error("Not supported"));
  }

  // Listen "message" event from Nexmo
  public listen(): Observable<Object> {
    if (!this.webhookServer) {
      return Observable.throw(new Error("No webhookServer found."));
    }

    return Observable.fromEvent(this.webhookServer, "message")
      .mergeMap((normalized: any) =>
        this.parser.parse(normalized))
      .mergeMap((parsed) => this.parser.validate(parsed))
      .mergeMap((validated) => {
        if (!validated) { return Observable.empty(); }
        return Promise.resolve(validated);
      });
  }

  public send(data: any): Promise<Object | Error> {
    this.logger.debug("sending", { message: data });
    return broidSchemas(data, "send")
      .then(() => {
        if (data.object.type !== "Note") {
          return Promise.reject(new Error("Only Note is supported."));
        }

        return Promise.resolve(data)
          .then((result: any) => {
            const toNumber = R.path(["to", "id"], result);
            const content = R.path(["object", "content"], result);
            return Promise.fromCallback((cb) =>
              this.session.message.sendSms(this.username, toNumber, content, {}, cb));
          })
          .then((result) => {
            const ids = R.map((message) => message["message-id"], result.messages);
            return { type: "sent", serviceID: this.serviceId(), ids };
          });
      });
  }
}
