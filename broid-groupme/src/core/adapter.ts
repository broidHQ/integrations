import * as Promise from "bluebird";
import broidSchemas from "@broid/schemas";
import { Logger } from "@broid/utils";
import { EventEmitter } from 'events';
import { Router  } from "express";
import * as uuid from "node-uuid";
import * as PromiseMemoize from "promise-memoize";
import * as R from "ramda";
import { Observable } from "rxjs/Rx";

import { getGroups, postMessage } from "./client";
import { IAdapterOptions } from "./interfaces";
import Parser from "./parser";
import WebHookServer from "./webHookServer";

export default class Adapter {
  private serviceID: string;
  private username: string;
  private token: string;
  private tokenSecret: string;
  private connected: boolean;
  private emitter: EventEmitter;
  private parser: Parser;
  private logLevel: string;
  private logger: Logger;
  private router: Router;
  private webhookServer: WebHookServer | null;

  constructor(obj: IAdapterOptions) {
    this.serviceID = obj && obj.serviceID || uuid.v4();
    this.logLevel = obj && obj.logLevel || "info";
    this.token = obj && obj.token || "";
    this.tokenSecret = obj && obj.tokenSecret || "";
    this.username = obj && obj.username || "";

    if (this.token === "") {
      throw new Error("Token should exist.");
    }

    if (this.tokenSecret === "") {
      throw new Error("TokenSecret should exist.");
    }

    if (this.username === "") {
      throw new Error("username should exist.");
    }

    this.emitter = new EventEmitter();
    this.parser = new Parser(this.serviceName(), this.serviceID, this.logLevel);
    this.logger = new Logger("adapter", this.logLevel);
    this.router = this.setupRouter();

    if (obj.http) {
      this.webhookServer = new WebHookServer(obj.http, this.router, this.logLevel);
    }
  }

  // Return the name of the Service/Integration
  public serviceName(): string {
    return "groupme";
  }

  // Returns the intialized express router
  public getRouter(): Router | null {
    if (this.webhookServer) {
      return null;
    }
    return this.router;
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
  public serviceId(): string {
    return this.serviceID;
  }

  // Connect to Groupme
  // Start the webhook server
  public connect(): Observable<Object> {
    if (this.connected) {
      return Observable.of({ type: "connected", serviceID: this.serviceId() });
    }

    this.connected = true;

    if (this.webhookServer) {
      this.webhookServer.listen();
    }

    return Observable.of(({ type: "connected", serviceID: this.serviceId() }));
  }

  public disconnect(): Promise<null> {
    if (this.webhookServer) {
      return this.webhookServer.close();
    }

    return Promise.resolve(null);
  }

  // Listen "message" event from Groupme
  public listen(): Observable<Object> {
    return Observable.fromEvent(this.emitter, "message")
      .mergeMap((event: any) => {
        return this.channels()
          .filter((group: any) => group.id === R.path(["body", "group_id"], event))
          .then((group: any) => R.assoc("group", group, event));
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

  private setupRouter(): Router {
    const router = Router();

    const handle = (req, res) => {
      if (!R.path(["body", "system"], req) &&
        this.username !== R.path(["body", "name"], req)) {
         this.emitter.emit("message", {
           body: req.body,
           headers: req.headers,
         });
      }

      // Assume all went well.
      res.sendStatus(200);
    };

    router.get("/", handle);
    router.post("/", handle);

    return router;
  }
}
