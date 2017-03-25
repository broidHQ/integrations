import * as Promise from "bluebird";
import * as bodyParser from "body-parser";
import { Logger } from "broid-utils";
import * as express from "express";
import * as xmlParser from "express-xml-bodyparser";
import * as http from "http";

import { IAdapterHTTPOptions } from "./interfaces";

export default class WebHookServer {
  private express: express.Application;
  private host: string;
  private httpClient: http.Server;
  private logger: Logger;
  private port: number;

  // Run configuration methods on the Express instance.
  constructor(options: IAdapterHTTPOptions, router: express.Router, logLevel: string) {
    this.host = options.host;
    this.port = options.port;
    this.logger = new Logger("webhook_server", logLevel);

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
    this.express.use(bodyParser.urlencoded({ extended: false }));
    this.express.use(xmlParser());

    this.express.use(router);
  }
 }
