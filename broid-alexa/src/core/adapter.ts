import * as Promise from "bluebird";
import broidSchemas from "broid-schemas";
import { Logger } from "broid-utils";
import * as EventEmitter from "eventemitter3";
import { Router  } from "express";
import * as uuid from "node-uuid";
import * as R from "ramda";
import { Observable } from "rxjs/Rx";

import { IAdapterOptions } from "./interfaces";
import Parser from "./parser";
import WebHookServer from "./webHookServer";

export default class Adapter {
  private serviceID: string;
  private connected: boolean;
  private emitter: EventEmitter;
  private parser: Parser;
  private logLevel: string;
  private logger: Logger;
  private router: Router;
  private webhookServer: WebHookServer | null;

  constructor(obj: IAdapterOptions) {
    this.serviceID = obj && obj.serviceID || uuid.v4();
    this.logLevel = obj && obj.logLevel || "info";

    this.emitter = new EventEmitter();
    this.parser = new Parser(this.serviceName(), this.serviceID, this.logLevel);
    this.logger = new Logger("adapter", this.logLevel);
    this.router = this.setupRouter();

    if (obj.http) {
      this.webhookServer = new WebHookServer(obj.http, this.router, this.logLevel);
    }
  }

  // Return the name of the Service/Integration
  public serviceName(): string {
    return "alexa";
  }

  // Returns the intialized express router
  public getRouter(): Router {
    if (this.webhookServer) {
      return false;
    }
    return this.router;
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
  public serviceId(): string {
    return this.serviceID;
  }

  // Connect to Nexmo
  // Start the webhook server
  public connect(): Observable<Object> {
    if (this.connected) {
      return Observable.of({ type: "connected", serviceID: this.serviceId() });
    }

    if (this.webhookServer) {
     this.connected = true;
     this.webhookServer.listen();
    }

    return Observable.of(({ type: "connected", serviceID: this.serviceId() }));
  }

  public disconnect(): Promise<Error> {
    if (this.webhookServer) {
      return this.webhookServer.close();
    }
    return Promise.resolve();
  }

  // Listen "message" event from Nexmo
  public listen(): Observable<Object> {
    if (!this.webhookServer) {
      return Observable.throw(new Error("No webhookServer found."));
    }

    return Observable.fromEvent(this.emitter, "message")
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

        this.emitter.emit(`response:${to}`, response);
        return Promise.resolve({ type: "sent", serviceID: this.serviceId() });
      });
  }

  private setupRouter(): Router {
    const router = Router();
    const handle = (req, res) => {
      const request = req.body.request;
      const session = req.body.session;

      const requestType = request.type;
      const intentName = requestType === "IntentRequest"
        ? R.path(["intent", "name"], request) :
        requestType;

      const messageID = uuid.v4();
      const message: any = {
        application: session.application,
        intentName,
        messageID,
        requestType,
        slots: R.path(["intent", "slots"], request) || {},
        user: session.user,
      };

      const responseListener = (data) => res.json(data);
      this.emitter.emit("message", message);
      this.emitter.once(`response:${messageID}`, responseListener);

      // save memory
      setTimeout(() => 
        this.emitter.removeListener(`response:${messageID}`,
          responseListener)
        , 60000);

      res.send("");
    };
    
    router.get("/", handle);
    router.post("/", handle);

    return router;
  }
}

