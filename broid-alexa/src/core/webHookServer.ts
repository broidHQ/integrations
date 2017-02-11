import * as bodyParser from "body-parser";
import { Logger } from "broid-utils";
import * as EventEmitter from "events";
import * as express from "express";
import * as uuid from "node-uuid";
import * as R from "ramda";

import { IAdapterHTTPOptions } from "./interfaces";

export default class WebHookServer extends EventEmitter {
  public emitAsync: any;
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
    const handle: any = (req, res) => {

      const request = req.body.request;
      const session = req.body.session;

      const requestType = request.type;
      const intentName = requestType === "IntentRequest"
        ? R.path(["intent", "name"], request) : requestType;

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

      this.emit("message", message);
      this.once(`response:${messageID}`, responseListener);

      // Save memory
      setTimeout(() => this.removeListener(`response:${messageID}`, responseListener)
        , 60000);
    };

    router.get("/", handle);
    router.post("/", handle);

    this.express.use("/", router);
  }
}
