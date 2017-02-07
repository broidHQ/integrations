import * as actionsSdk from "actions-on-google";
import * as Promise from "bluebird";
import broidSchemas from "broid-schemas";
import { Logger } from "broid-utils";
import * as uuid from "node-uuid";
import * as R from "ramda";
import { Observable } from "rxjs/Rx";

import { IAdapterHTTPOptions, IAdapterOptions } from "./interfaces";
import Parser from "./parser";
import WebHookServer from "./webHookServer";

const events = [
  "assistant.intent.action.MAIN",
  "assistant.intent.action.TEXT",
  "assistant.intent.action.PERMISSION",
];

export default class Adapter {
  private serviceID: string;
  private token: string | null;
  private tokenSecret: string | null;
  private HTTPOptions: IAdapterHTTPOptions;
  private connected: boolean;
  private parser: Parser;
  private logLevel: string;
  private username: string;
  private logger: Logger;
  private webhookServer: WebHookServer;

  constructor(obj?: IAdapterOptions) {
    this.serviceID = obj && obj.serviceID || uuid.v4();
    this.logLevel = obj && obj.logLevel || "info";
    this.token = obj && obj.token || null;
    this.tokenSecret = obj && obj.tokenSecret || null;
    this.username = obj && obj.username || "";

    const HTTPOptions: IAdapterHTTPOptions = {
      host: "127.0.0.1",
      port: 8080,
    };
    this.HTTPOptions = obj && obj.http || HTTPOptions;
    this.HTTPOptions.host = this.HTTPOptions.host || HTTPOptions.host;
    this.HTTPOptions.port = this.HTTPOptions.port || HTTPOptions.port;

    this.parser = new Parser(this.serviceID, this.username, this.logLevel);
    this.logger = new Logger("adapter", this.logLevel);
  }

  // Return list of users information
  public users(): Promise<Error>{
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

  // Connect to Callr
  // Start the webhook server
  public connect(): Observable<Object> {
    if (this.connected) {
      return Observable.of({ type: "connected", serviceID: this.serviceId() });
    }
    this.connected = true;

    if (!this.username || this.username === "") {
      return Observable.throw(new Error("Username should exist."));
    }

    this.webhookServer = new WebHookServer(this.HTTPOptions, this.logLevel);
    R.forEach((event) =>
      this.webhookServer.addIntent(event), events);
    this.webhookServer.listen();

    return Observable.of(({ type: "connected", serviceID: this.serviceId() }));
  }

  public disconnect(): Promise<Error> {
    return Promise.reject(new Error("Not supported"));
  }

  // Listen "message" event from Google
  public listen(): Observable<Object> {
    if (!this.webhookServer) {
      return Observable.throw(new Error("No webhookServer found."));
    }

    const fromEvents =  R.map((event) =>
      Observable.fromEvent(this.webhookServer, event), events);

    return Observable.merge(...fromEvents)
      .mergeMap((normalized: actionsSdk.ActionsSdkAssistant) =>
        this.parser.parse(normalized))
      .mergeMap((parsed) => this.parser.validate(parsed))
      .mergeMap((validated) => {
        if (!validated) { return Observable.empty(); }
        return Promise.resolve(validated);
      });
  }

  public send(data: Object): Promise<Object | Error> {
    this.logger.debug("sending", { message: data });
    return broidSchemas(data, "send")
      .then(() => {
        let ssml = false;
        const content: any = R.path(["object", "content"], data)
          || R.path(["object", "name"], data);
        const type: any = R.path(["object", "type"], data);

        // <speak><say-as interpret-as="cardinal">12345</say-as></speak>
        if (content.startsWith("<speak>") && content.endsWith("</speak>")) {
          ssml = true;
        }

        // TODO
        // Support `noInputs` parameter
        // https://github.com/broidHQ/feedhack/issues/19
        const noInputs = [];

        if (type === "Note") {
          return this.webhookServer.send(ssml, content, noInputs)
            .then(() => ({ type: "sent", serviceID: this.serviceId() }));
        }

        return Promise.reject(new Error("Note is only supported."));
      });
  }
}
