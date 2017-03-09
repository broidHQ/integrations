import * as bodyParser from "body-parser";
import { Logger } from "broid-utils";
import { EventEmitter } from "events";
import * as express from "express";

import { IAdapterHTTPOptions, IWebHookEvent } from "./interfaces";

export default class WebHookServer extends EventEmitter {
  private express: express.Application;
  private logger: Logger;
  private tokenSecret: string;
  private host: string;
  private port: number;

  // Run configuration methods on the Express instance.
  constructor(tokenSecret: string, options?: IAdapterHTTPOptions, logLevel?: string) {
    super();
    this.host = options && options.host || "127.0.0.1";
    this.port = options && options.port || 8080;
    this.tokenSecret = tokenSecret || "";
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

    // Endpoint to verify the trust
    router.get("/", (req, res) => {
      if (req.query["hub.mode"] === "subscribe") {
        if (req.query["hub.verify_token"] === this.tokenSecret) {
          res.send(req.query["hub.challenge"]);
        } else {
          res.send("OK");
        }
      }
    });

    // route handler
    router.post("/", (req, res) => {
      const event: IWebHookEvent = {
        request: req,
        response: res,
      };

      this.emit("message", event);

      // Assume all went well.
      res.sendStatus(200);
    });

    this.express.use("/", router);
  }
}
