import * as Promise from "bluebird";
import broidSchemas from "broid-schemas";
import { Logger } from "broid-utils";
import * as uuid from "node-uuid";
import * as PromiseMemoize from "promise-memoize";
import * as R from "ramda";
import { Observable } from "rxjs/Rx";

import { getGroups, postMessage } from "./client";
import { IAdapterHTTPOptions, IAdapterOptions } from "./interfaces";
import Parser from "./parser";
import WebHookServer from "./webHookServer";

export default class Adapter {
  private serviceID: string;
  private username: string;
  private token: string;
  private tokenSecret: string;
  private HTTPOptions: IAdapterHTTPOptions;
  private connected: boolean;
  private parser: Parser;
  private logLevel: string;
  private logger: Logger;
  private webhookServer: WebHookServer;

  constructor(obj?: IAdapterOptions) {
    this.serviceID = obj && obj.serviceID || uuid.v4();
    this.logLevel = obj && obj.logLevel || "info";
    this.token = obj && obj.token || "";
    this.tokenSecret = obj && obj.tokenSecret || "";
    this.username = obj && obj.username || "";

    const HTTPOptions: IAdapterHTTPOptions = {
      host: "127.0.0.1",
      port: 8080,
    };
    this.HTTPOptions = obj && obj.http || HTTPOptions;
    this.HTTPOptions.host = this.HTTPOptions.host || HTTPOptions.host;
    this.HTTPOptions.port = this.HTTPOptions.port || HTTPOptions.port;

    if (this.token === "") {
      throw new Error("Token should exist.");
    }

    if (this.tokenSecret === "") {
      throw new Error("TokenSecret should exist.");
    }

    if (this.username === "") {
      throw new Error("username should exist.");
    }

    this.parser = new Parser(this.serviceID, this.logLevel);
    this.logger = new Logger("adapter", this.logLevel);
  }

  // Return list of users information
  public users(): Promise<Error> {
    return Promise.reject(new Error("Not supported"));
  }

  // Return list of channels information
  public channels(): Promise<any> {
    const getGroupCached =  PromiseMemoize(getGroups, { maxAge: 350000 });
    return getGroupCached(this.tokenSecret)
      .then(R.map((channel: any) => {
        return {
          created_at: channel.created_at,
          id: channel.id,
          members: R.map((member: any) =>
            ({
              avatar: member.image_url,
              id: member.user_id,
              username: member.nickname,
            }),
            channel.members),
          name: channel.name,
          type: channel.type,
          updated_at: channel.updated_at,
        };
      }));
  }

  // Return the service ID of the current instance
  public serviceId(): String {
    return this.serviceID;
  }

  // Connect to Groupme
  // Start the webhook server
  public connect(): Observable<Object> {
    if (this.connected) {
      return Observable.of({ type: "connected", serviceID: this.serviceId() });
    }
    this.connected = true;

    this.webhookServer = new WebHookServer(this.username, this.HTTPOptions, this.logLevel);
    this.webhookServer.listen();

    return Observable.of(({ type: "connected", serviceID: this.serviceId() }));
  }

  public disconnect(): Promise<Error> {
    return Promise.reject(new Error("Not supported"));
  }

  // Listen "message" event from Groupme
  public listen(): Observable<Object> {
    if (!this.webhookServer) {
      return Observable.throw(new Error("No webhookServer found."));
    }

    return Observable.fromEvent(this.webhookServer, "message")
      .mergeMap((event: any) => {
        return this.channels()
          .filter((group) => group.id === R.path(["body", "group_id"], event))
          .then((group) => R.assoc("group", group, event));
      })
      .mergeMap((normalized: any) =>
        this.parser.parse(normalized))
      .mergeMap((parsed) => this.parser.validate(parsed))
      .mergeMap((validated) => {
        if (!validated) { return Observable.empty(); }
        return Promise.resolve(validated);
      });
  }

  public send(data: any): Promise<Object | Error> {
    this.logger.debug("sending", { message: data });
    return broidSchemas(data, "send")
      .then(() => {
        if (data.object.type !== "Note" && data.object.type !== "Image") {
          return Promise.reject(new Error("Only Note or Image is supported."));
        }

        return Promise.resolve(data)
          .then((result: any) => {
            const type: any = R.path(["object", "type"], data);
            const content: any = R.path(["object", "content"], result);

            const payload: any = {
              bot_id: this.token,
              text: content,
            };

            if (type === "Image") {
              payload.image = {
                mediaType: R.path(["object", "mediaType"], data),
                url: R.path(["object", "url"], data),
              };
            }

            return postMessage(this.tokenSecret, payload);
          })
          .then(() => ({ type: "sent", serviceID: this.serviceId() }));
      });
  }
}
