import * as bodyParser from "body-parser";
import { Logger } from "broid-utils";
import * as EventEmitter from "events";
import * as express from "express";
import * as R from "ramda";

import { IAdapterHTTPOptions } from "./interfaces";

export default class WebHookServer extends EventEmitter {
  private express: express.Application;
  private logger: Logger;
  private host: string;
  private username: string;
  private port: number;

  // Run configuration methods on the Express instance.
  constructor(username: string, options?: IAdapterHTTPOptions, logLevel?: string) {
    super();
    this.username = username;
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
      if (!R.path(["body", "system"], req) && this.username !== R.path(["body", "name"], req)) {
         this.emit("message", {
           body: req.body,
           headers: req.headers,
         });
      }

      // Assume all went well.
      res.sendStatus(200);
    };

    router.get("/", handle);
    router.post("/", handle);

    this.express.use("/", router);
  }
}
