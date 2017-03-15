import * as Promise from "bluebird";
import * as bodyParser from "body-parser";
import { Logger } from "broid-utils";
import * as express from "express";
import * as http from "http";
import * as uuid from "node-uuid";
import * as R from "ramda";

import { IAdapterHTTPOptions } from "./interfaces";

export default class WebHookServer {
  public emitAsync: any;
  private express: express.Application;
  private logger: Logger;
  private httpClient: http.Server;
  private host: string;
  private port: number;

  // Run configuration methods on the Express instance.
  constructor(options: IAdapterHTTPOptions, router: express.Router, logLevel?: string) {
    this.host = options.host;
    this.port = options.port;
    this.logger = new Logger("webhook_server", logLevel || "info");
    this.setupExpress(router);
  }

  public listen() {
    this.httpClient = this.express.listen(this.port, this.host, () => {
      this.logger.info(`Server listening on port ${this.host}:${this.port}...`);
    });
  }

  public close(): Promise<null> {
    return Promise.fromCallback((cb) => this.httpClient.close(cb));
  }

  private setupExpress(router: express.Router) {
    this.express = express();
    this.express.use(bodyParser.json());
    this.express.use(bodyParser.urlencoded({ extended: false  }));
    this.express.use("/", router);
  }

  // Configure API endpoints.
  // private routes(): void {
    // const router = express.Router();
    // const handle: any = (req, res) => {

      // const request = req.body.request;
      // const session = req.body.session;

      // const requestType = request.type;
      // const intentName = requestType === "IntentRequest"
        // ? R.path(["intent", "name"], request) : requestType;

      // const messageID = uuid.v4();
      // const message: any = {
        // application: session.application,
        // intentName,
        // messageID,
        // requestType,
        // slots: R.path(["intent", "slots"], request) || {},
        // user: session.user,
      // };

      // const responseListener = (data) => res.json(data);

      // this.emit("message", message);
      // this.once(`response:${messageID}`, responseListener);

      // // Save memory
      // setTimeout(() => this.removeListener(`response:${messageID}`, responseListener)
        // , 60000);
    // };

    // router.get("/", handle);
    // router.post("/", handle);

    // this.express.use("/", router);
  // }
}
