import * as Promise from "bluebird";
import broidSchemas from "broid-schemas";
import { cleanNulls, Logger } from "broid-utils";
import * as uuid from "node-uuid";
import * as R from "ramda";

import { IActivityStream, IContextObject } from "./interfaces";

export default class Parser {
  public serviceID: string;
  public generatorName: string;
  private logger: Logger;

  constructor(serviceID: string, logLevel: string) {
    this.serviceID = serviceID;
    this.generatorName = "line";
    this.logger = new Logger("parser", logLevel);
  }

  // Validate parsed data with Broid schema validator
  public validate(event: any): Promise<any> {
    this.logger.debug("Validation process", { event });

    const parsed = cleanNulls(event);
    if (!parsed || R.isEmpty(parsed)) { return Promise.resolve(null); }

    if (!parsed.type) {
      this.logger.debug("Type not found.", { parsed });
      return Promise.resolve(null);
    }

    return broidSchemas(parsed, "activity")
      .then(() => parsed)
      .catch((err) => {
        this.logger.error(err);
        return null;
      });
  }

  // Convert normalized data to Broid schema
  public parse(event: any): Promise<any> {
    this.logger.debug("Parse process", { event });

    const normalized = cleanNulls(event);
    if (!normalized || R.isEmpty(normalized)) { return Promise.resolve(null); }

    const activitystreams = this.createActivityStream(normalized);
    activitystreams.actor = this.createAuthor(normalized.source);
    activitystreams.target = this.createTarget(normalized.source);

    const type = R.path(["message", "type"], normalized);
    if (!type) {
      return Promise.reject(new Error("Line message should contain type information."));
    }

    const id = R.path(["message", "id"], normalized) || this.createIdentifier();
    const context: IContextObject = {
      content: normalized.replyToken,
      name: "reply_token",
      type: "Object",
    };

    if (type.toLowerCase() === "image" || type.toLowerCase() === "video") {
      activitystreams.object = {
        context,
        id,
        type: "Image",
        url: "https://buffer_not_supported.broid.ai",
      };
    } else if (type.toLowerCase() === "location") {
      activitystreams.object = {
        content: R.path(["message", "address"], normalized),
        context,
        id,
        latitude: R.path(["message", "latitude"], normalized),
        longitude: R.path(["message", "longitude"], normalized),
        type: "Place",
      };
    }

    if (!activitystreams.object
      && R.path(["message", "text"], normalized)
      && !R.isEmpty(R.path(["message", "text"], normalized))) {
      activitystreams.object = {
        content: R.path(["message", "text"], normalized),
        context,
        id,
        type: "Note",
      };
    }

    return Promise.resolve(activitystreams);
  }

  // Normalize the raw event
  public normalize(event: any): Promise<any> {
    this.logger.debug("Event received to normalize");

    if (event.type === "postback") {
      event.message = {
        text: R.path(["postback", "data"], event),
        type: "postback",
      };
    }

    // TODO https://github.com/broidHQ/feedhack/issues/4
    // support image, video message
    // return this.session.getMessageContent(R.path(['message', 'id'], event))
    //   .then(info => R.assoc('media', info, event));

    return Promise.resolve(event);
  }

  private createIdentifier(): string {
    return uuid.v4();
  }

  private createActivityStream(normalized): IActivityStream {
    return {
      "@context": "https://www.w3.org/ns/activitystreams",
      "generator": {
        id: this.serviceID,
        name: this.generatorName,
        type: "Service",
      },
      "published": normalized.timestamp ?
        Math.floor(normalized.timestamp / 1000)
        : Math.floor(Date.now() / 1000),
      "type": "Create",
    };
  }

  private createAuthor(source: any): any {
    if (source.userId) {
      return {
        id: source.userId,
        name: source.displayName || source.userId,
        type: "Person",
      };
    }

    return {
      id: "broid_ghost",
      name: "Broid Ghost",
      type: "Person",
    };
  }

  private createTarget(source: any): any {
    if (source.userId) {
      return {
        id: source.userId,
        name: source.displayName || source.userId,
        type: "Person",
      };
    } else if (source.type === "group") {
      return {
        id: source.groupId,
        name: source.groupId,
        type: "Group",
      };
    } else if (source.type === "room") {
      return {
        id: source.roomId,
        name: source.roomId,
        type: "Group",
      };
    }
    return {};
  }
}
