import * as Promise from "bluebird";
import broidSchemas from "broid-schemas";
import { Logger } from "broid-utils";
import { EventEmitter } from "events";
import * as irc from "irc";
import * as uuid from "node-uuid";
import { Observable } from "rxjs/Rx";

import { IAdapterOptions, ISendParameters } from "./interfaces";
import Parser from "./parser";

export default class Adapter {
  public serviceID: string;

  private address: string;
  private username: string;
  private channels: string[];
  private client: any;
  private logLevel: string;
  private connectTimeout: number;
  private logger: Logger;
  private ee: EventEmitter;
  private parser: Parser;

  constructor(obj: IAdapterOptions) {
    this.serviceID = obj && obj.serviceID || uuid.v4();
    this.logLevel = obj && obj.logLevel || "info";
    this.connectTimeout = obj && obj.connectTimeout || 60000;
    this.address = obj && obj.address;
    this.username = obj && obj.username;
    this.channels = obj && obj.channels;
    this.ee = new EventEmitter();

    this.parser = new Parser(this.username, this.serviceID, this.logLevel);
    this.logger = new Logger("adapter", this.logLevel);
  }

  // Return the service ID of the current instance
  public serviceId(): String {
    return this.serviceID;
  }

  public connect(): Observable<Object> {
    if (!this.address) {
      return Observable.throw(new Error("IRC address is not set"));
    }
    if (!this.username) {
      return Observable.throw(new Error("IRC username is not set"));
    }

    this.client = Promise.promisifyAll(new irc.Client(this.address, this.username, {
      autoConnect: false,
      channels: this.channels,
    }));

    const connect = this.client.connectAsync()
      .catch((err) => {
        if (err.rawCommand !== "001") {
          throw err;
        }
      })
      .then(() => {
        // RxJS doesn't like the event emitted that comes with node irc,
        // so we remake one instead.
        this.client.addListener("message", (from, to, message) => {
          this.ee.emit("message", {from, to, message});
        });

        return Observable.of({ type: "connected", serviceID: this.serviceId() });
      });

    return Observable.fromPromise(connect)
      .timeout(this.connectTimeout);
  }

  public disconnect(): Promise<null> {
    return this.client.disconnectAsync();
  }

  public listen(): Observable<Object> {
    return Observable.fromEvent(this.ee, "message")
      .map((normalized: Object | null) => this.parser.parse(normalized))
      .map((parsed: Object | null) => this.parser.validate(parsed))
      .map((validated: Object | null) => {
        if (!validated) { return Observable.empty(); }
        return Promise.resolve(validated);
      });
  }

  public send(data: ISendParameters): Promise<Object | Error> {
    this.logger.debug("sending", { message: data });

    return broidSchemas(data, "send")
      .then(() => {
        const message: string = data.object.content;
        let to: string = data.to.id;
        if (data.to.type === "Group" && !to.includes("#")) {
          to = `#${to}`;
        }
        this.client.say(to, message);

        return { type: "sent", serviceID: this.serviceId() };
      });
  }
}
