import * as bodyParser from "body-parser";
import { Logger } from "@broid/utils";
import * as EventEmitter from "eventemitter3";
import * as express from "express";
import * as twilio from "twilio";

import { IAdapterHTTPOptions, ITwilioWebHookEvent } from "./interfaces";

export default class WebHookServer extends EventEmitter {
  private express: express.Application;
  private logger: Logger;
  private host: string;
  private port: number;

  // Run configuration methods on the Express instance.
  constructor(options?: IAdapterHTTPOptions, logLevel?: string) {
    super();
    this.host = options && options.host || "127.0.0.1";
    this.port = options && options.port || 8080;
    this.logger = new Logger("webhook_server", logLevel || "info");
    this.express = express();
    this.middleware();
    this.routes();
  }

  public listen() {
    this.express.listen(this.port, this.host, () => {
      this.logger.info(`Server listening at port ${this.host}:${this.port}...`);
    });
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
      const event: ITwilioWebHookEvent = {
        request: req,
        response: res,
      };

      this.emit("message", event);

      const twiml = new twilio.TwimlResponse();
      res.type("text/xml");
      res.send(twiml.toString());
    });

    this.express.use("/", router);
  }
}
