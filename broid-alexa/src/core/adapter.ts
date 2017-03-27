import * as Promise from "bluebird";
import broidSchemas from "@broid/schemas";
import { Logger } from "@broid/utils";
import * as uuid from "node-uuid";
import { Observable } from "rxjs/Rx";

import { IAdapterHTTPOptions, IAdapterOptions } from "./interfaces";
import Parser from "./parser";
import WebHookServer from "./webHookServer";

export default class Adapter {
  private serviceID: string;
  private HTTPOptions: IAdapterHTTPOptions;
  private connected: boolean;
  private parser: Parser;
  private logLevel: string;
  private logger: Logger;
  private webhookServer: WebHookServer;
  // private session: any;

  constructor(obj?: IAdapterOptions) {
    this.serviceID = obj && obj.serviceID || uuid.v4();
    this.logLevel = obj && obj.logLevel || "info";

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

        const content: string = data.object.content;
        const to: string = data.to.id;

        let outputSpeech: any = {
          text: content,
          type: "PlainText",
        };

        if (content.startsWith("<speak>") && content.endsWith("</speak>")) {
          outputSpeech = {
            ssml: content,
            type: "SSML",
          };
        }

        const card: any = {
          content,
          title: data.object.name || "",
          type: "Simple",
        };

        const response: any = {
          response: {
            card,
            outputSpeech,
            shouldEndSession: true,
          },
        };

        this.webhookServer.emit(`response:${to}`, response);
        return Promise.resolve({ type: "sent", serviceID: this.serviceId() });
      });
  }
}
