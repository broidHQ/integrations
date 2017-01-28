import * as Promise from "bluebird";
import broidSchemas from "broid-schemas";
import { cleanNulls, concat, Logger } from "broid-utils";
import * as uuid from "node-uuid";
import * as R from "ramda";

import { IActivityStream } from "./interfaces";

export default class Parser {
  public serviceID: string;
  public generatorName: string;
  private logger: Logger;

  constructor(serviceID: string, logLevel: string) {
    this.serviceID = serviceID;
    this.generatorName = "kik";
    this.logger = new Logger("parser", logLevel);
  }

  // Validate parsed data with Broid schema validator
  public validate(event: any): Promise<Object> {
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
  public parse(event: any): Promise<IActivityStream> {
    this.logger.debug("Normalize process", { event });

    const normalized = cleanNulls(event);
    if (!normalized || R.isEmpty(normalized)) { return Promise.resolve(null); }

    const activitystreams = this.createActivityStream(normalized);
    activitystreams.actor = {
      id: normalized.from.id.toString(),
      name: concat([normalized.from.firstName, normalized.from.lastName]),
      type: "Person",
    };

    activitystreams.target = {
      id: normalized.chatID.toString(),
      name: normalized.chatID.toString(),
      type: "Person",
    };

    // Process potentially media.
    if (normalized.type === "Image" || normalized.type === "Video") {
      let type = "Image";
      if (normalized.type === "Video") {
        type = "Video";
      }

      activitystreams.object = {
        id: normalized.id.toString() || this.createIdentifier(),
        type,
        url: normalized.content,
      };
    }

    if (R.isEmpty(activitystreams.object) && !R.isEmpty(normalized.content)) {
      activitystreams.object = {
        content: normalized.content,
        id: normalized.id.toString() || this.createIdentifier(),
        type: "Note",
      };
    }

    return Promise.resolve(activitystreams);
  }

  // Normalize the raw event
  public normalize(event: any, userInformation: any): Promise<any> {
    this.logger.debug("Event received to normalize");

    const data: any = {
      chatID: event.chatId,
      content: "",
      createdTimestamp: event.timestamp,
      from: userInformation,
      id: event.id,
      type: "",
    };

    if (event.type === "text") {
      data.type = "Note";
      data.content = event.body;
    } else if (event.type === "picture") {
      data.type = "Image";
      data.content = event.picUrl;
    } else if (event.type === "video") {
      data.type = "Video";
      data.content = event.videoUrl;
    }

    return Promise.resolve(data);
  }

  private createIdentifier(): string {
    return uuid.v4();
  }

  private createActivityStream(normalized): IActivityStream {
    return {
      "@context": "https://www.w3.org/ns/activitystreams",
      "actor": {},
      "generator": {
        id: this.serviceID,
        name: this.generatorName,
        type: "Service",
      },
      "object": {},
      "published": normalized.createdTimestamp ?
        Math.floor(normalized.createdTimestamp / 1000)
        : Math.floor(Date.now() / 1000),
      "target": {},
      "type": "Create",
    };
  }
}
