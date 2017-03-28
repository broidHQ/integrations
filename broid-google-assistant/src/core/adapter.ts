import * as actionsSdk from "actions-on-google";
import * as Promise from "bluebird";
import broidSchemas from "@broid/schemas";
import { Logger } from "@broid/utils";
import { EventEmitter  } from 'events';
import { Router   } from "express";
import * as uuid from "node-uuid";
import * as R from "ramda";
import { Observable } from "rxjs/Rx";

import { IAdapterOptions } from "./interfaces";
import Parser from "./parser";
import WebHookServer from "./webHookServer";

const events = [
  "assistant.intent.action.MAIN",
  "assistant.intent.action.TEXT",
  "assistant.intent.action.PERMISSION",
];

export default class Adapter {
  private assistant: actionsSdk.ActionsSdkAssistant;
  private actionsMap: Map<string, actionsSdk.ActionHandler>;
  private serviceID: string;
  private token: string | null;
  private tokenSecret: string | null;
  private connected: boolean;
  private emitter: EventEmitter;
  private parser: Parser;
  private logLevel: string;
  private username: string;
  private logger: Logger;
  private router: Router;
  private webhookServer: WebHookServer | null;

  constructor(obj: IAdapterOptions) {
    this.serviceID = obj && obj.serviceID || uuid.v4();
    this.logLevel = obj && obj.logLevel || "info";
    this.token = obj && obj.token || null;
    this.tokenSecret = obj && obj.tokenSecret || null;
    this.username = obj && obj.username || "";
    this.actionsMap = new Map();

    this.emitter = new EventEmitter();
    this.parser = new Parser(this.serviceName(), this.serviceID, this.username, this.logLevel);
    this.logger = new Logger("adapter", this.logLevel);
    this.router = this.setupRouter();

    if (obj.http) {
     this.webhookServer = new WebHookServer(obj.http, this.router, this.logLevel);
    }
  }

  // Return the name of the Service/Integration
  public serviceName(): string {
    return "google-assistant";
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
  public serviceId(): string {
    return this.serviceID;
  }

  // Returns the intialized express router
  public getRouter(): Router | null {
    if (this.webhookServer) {
      return null;
    }

    return this.router;
  }

  // Connect to Google Assistant
  // Start the webhook server
  public connect(): Observable<Object> {
    if (this.connected) {
      return Observable.of({ type: "connected", serviceID: this.serviceId() });
    }

    if (!this.username || this.username === "") {
      return Observable.throw(new Error("Username should exist."));
    }

    this.connected = true;
    R.forEach((event) => this.addIntent(event), events);

    if (this.webhookServer) {
      this.webhookServer.listen();
    }

    return Observable.of(({ type: "connected", serviceID: this.serviceId() }));
  }

  public disconnect(): Promise<null> {
    if (this.webhookServer) {
      return this.webhookServer.close();
    }
    return Promise.resolve(null);
  }

  // Listen "message" event from Google
  public listen(): Observable<Object> {
    const fromEvents =  R.map((event) =>
      Observable.fromEvent(this.emitter, event), events);

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
          return this.sendMessage(ssml, content, noInputs)
            .then(() => ({ type: "sent", serviceID: this.serviceId() }));
        }

        return Promise.reject(new Error("Note is only supported."));
      });
  }

  private addIntent(trigger): void {
    this.actionsMap.set(trigger, () => {
      const body = this.assistant.body_;
      const conversationId = this.assistant.getConversationId();
      let deviceLocation = null;
      const intent = this.assistant.getIntent();
      const user = this.assistant.getUser();
      const userInput = this.assistant.getRawInput();

      if (this.assistant.isPermissionGranted()) {
        deviceLocation = this.assistant.getDeviceLocation();
      }

      this.emitter.emit(trigger, {
        body,
        conversationId,
        deviceLocation,
        intent,
        user,
        userInput,
      });
    });
  }

  private setupRouter(): Router {
    const router = Router();

    router.post("/", (req, res) => {
      this.assistant = new actionsSdk.ActionsSdkAssistant({request: req, response: res});
      this.assistant.handleRequest(this.actionsMap);
      res.sendStatus(200);
    });

    return router;
  }

  private sendMessage(isSSML: boolean, content: string, noInputs: string[]): Promise<boolean> {
    const inputPrompt = this.assistant.buildInputPrompt(isSSML, content, noInputs);
    this.assistant.ask(inputPrompt);
    return Promise.resolve(true);
  }
}
