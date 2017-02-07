import * as actionsSdk from "actions-on-google";
import * as Promise from "bluebird";
import * as bodyParser from "body-parser";
import { Logger } from "broid-utils";
import { EventEmitter } from "events";
import * as express from "express";

import { IAdapterHTTPOptions } from "./interfaces";

export default class WebHookServer extends EventEmitter {
  private actionsMap: Map<string, actionsSdk.ActionHandler>;
  private assistant: actionsSdk.ActionsSdkAssistant;
  private express: express.Application;
  private logger: Logger;
  private host: string;
  private port: number;

  // Run configuration methods on the Express instance.
  constructor(options?: IAdapterHTTPOptions, logLevel?: string) {
    super();
    this.actionsMap = new Map();
    this.host = options && options.host || "127.0.0.1";
    this.port = options && options.port || 8080;
    this.logger = new Logger("webhook_server", logLevel || "info");
    this.express = express();
    this.middleware();
    this.routes();
  }

  public addIntent(trigger): void {
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

      this.emit(trigger, {
        body,
        conversationId,
        deviceLocation,
        intent,
        user,
        userInput,
      });
    });
  }

  public listen() {
    this.express.listen(this.port, this.host, () => {
      this.logger.info(`Server listening at port ${this.host}:${this.port}...`);
    });
  }

  public send(isSSML: boolean, content: string, noInputs: string[]): Promise<boolean> {
    const inputPrompt = this.assistant
      .buildInputPrompt(isSSML, content, noInputs);
    this.assistant.ask(inputPrompt);
    return Promise.resolve(true);
  }

  // Configure Express middleware.
  private middleware(): void {
    this.express.use(bodyParser.json());
    this.express.use(bodyParser.urlencoded({ extended: false }));
  }

  // Configure API endpoints.
  private routes(): void {
    const router = express.Router();
    // placeholder route handler
    router.post("/", (req, res) => {
      this.assistant = new actionsSdk
        .ActionsSdkAssistant({request: req, response: res});
      this.assistant.handleRequest(this.actionsMap);
    });

    this.express.use("/", router);
  }
}
