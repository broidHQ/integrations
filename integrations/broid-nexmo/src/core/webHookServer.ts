import * as bodyParser from "body-parser";
import { Logger } from "broid-utils";
import * as EventEmitter from "events";
import * as express from "express";

import { IAdapterHTTPOptions } from "./interfaces";

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
    const handle = (req, res) => {
      let query: any = {};
      if (req.method === "GET") {
        query = req.query;
      } else if (req.method === "POST") {
        query = req.body;
      }

      const message: any = {
        keyword: query.keyword,
        messageId: query.messageId,
        msisdn: query.msisdn,
        text: query.text,
        timestamp: query["message-timestamp"],
        to: query.to,
      };

      this.emit("message", message);
      // Assume all went well.
      res.sendStatus(200);
    };

    router.get("/", handle);
    router.post("/", handle);

    this.express.use("/", router);
  }
}
