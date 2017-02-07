import * as Promise from "bluebird";
import broidSchemas from "broid-schemas";
import { cleanNulls, Logger } from "broid-utils";
import * as uuid from "node-uuid";
import * as R from "ramda";

import { IActivityStream } from "./interfaces";

export default class Parser {
  public serviceID: string;
  public generatorName: string;
  private logger: Logger;
  private username: string;

  constructor(username: string, serviceID: string, logLevel: string) {
    this.serviceID = serviceID;
    this.generatorName = "irc";
    this.username = username;
    this.logger = new Logger("parser", logLevel);
  }

  // Validate parsed data with Broid schema validator
  public validate(event: Object | null): Promise<Object | null> {
    this.logger.debug("Validation process", { event });

    const parsed = cleanNulls(event);
    if (!parsed || R.isEmpty(parsed)) { return Promise.resolve(null); }

    if (!parsed.type) {
      this.logger.debug("Type not found.", { parsed });
      return Promise.resolve(null);
    }

    return broidSchemas(parsed, "activity")
      .return(parsed)
      .catch((err) => {
        this.logger.error(err);
        return null;
      });
  }

  // Convert normalized data to Broid schema
  public parse(event: Object | null): Promise<Object | null> {
    this.logger.debug("Normalized process");

    const normalized = cleanNulls(event);
    if (!normalized || R.isEmpty(normalized)) { return Promise.resolve(null); }

    const activitystreams: IActivityStream = {
      "@context": "https://www.w3.org/ns/activitystreams",
      "actor": {
        id: normalized.from,
        name: normalized.from,
        type: "Person",
      },
      "generator": {
        id: this.serviceID,
        name: this.generatorName,
        type: "Service",
      },
      "object": {
        content: normalized.message,
        id: uuid.v4(),
        type: "Note",
      },
      "published": Math.floor(Date.now() / 1000),
      "target": {
        id: normalized.to,
        name: normalized.to,
        type: normalized.to === this.username ? "Person" : "Group",
      },
      "type": "Create",
    };

    return Promise.resolve(activitystreams);
  }
}
