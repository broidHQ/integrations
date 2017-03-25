import { Logger } from "@broid/utils";
import * as http from "http";

import { IAdapterHTTPOptions } from "./interfaces";

export default class WebHookServer {
  private logger: Logger;
  private host: string;
  private port: number;

  // Run configuration methods on the Express instance.
  constructor(options?: IAdapterHTTPOptions, logLevel?: string) {
    this.host = options && options.host || "127.0.0.1";
    this.port = options && options.port || 8080;
    this.logger = new Logger("webhook_server", logLevel || "info");
  }

  public listen(handler: any) {
    http.createServer(handler)
      .listen(this.port, this.host, () => {
        this.logger.info(`Server listening at port ${this.host}:${this.port}...`);
      });
  }
}
