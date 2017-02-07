import * as actionsSdk from "actions-on-google";
import * as Promise from "bluebird";
import { default as broidSchemas, IActivityStream } from "broid-schemas";
import { cleanNulls, Logger } from "broid-utils";
import * as uuid from "node-uuid";
import * as R from "ramda";

export default class Parser {
  public serviceID: string;
  public generatorName: string;
  private logger: Logger;
  private username: string;

  constructor(serviceID: string, username: string, logLevel: string) {
    this.serviceID = serviceID;
    this.generatorName = "google-assistant";
    this.logger = new Logger("parser", logLevel);
    this.username = username;
  }

  // Validate parsed data with Broid schema validator
  public validate(event: any): Promise<Object | null> {
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
  public parse(event: actionsSdk.ActionsSdkAssistant): Promise<Object | null> {
    this.logger.debug("Normalize process", { event });

    const normalized = cleanNulls(event);
    if (!normalized || R.isEmpty(normalized)) { return Promise.resolve(null); }

    const activitystreams = this.createActivityStream();

    let displayName = R.path(["user", "profile", "display_name"], normalized);
    if (!displayName && R.path(["user", "profile", "given_name"], normalized)
      && R.path(["user", "profile", "family_name"], normalized)) {
        displayName = `${R.path(["user", "profile", "given_name"], normalized)} ${R.path(["user", "profile", "family_name"], normalized)} `;
    }

    activitystreams.actor = {
      id:  R.path(["user", "user_id"], normalized),
      name: displayName ? displayName : normalized.userId,
      type: "Person",
    };

    activitystreams.target = {
      id: this.username,
      name: this.username,
      type: "Application",
    };

    let input: any = R.path(["body", "inputs"], normalized) || [];
    input = input[0] || {};

    const context = R.map((arg) => {
      return {
        content: R.prop("raw_text", arg),
        name: R.prop("name", arg),
        type: "Object",
      };
    }, input.arguments || []);

    activitystreams.object = {
      content: normalized.userInput,
      context,
      id: normalized.conversationId || this.createIdentifier(),
      type: "Note",
    };

    return Promise.resolve(activitystreams);
  }

  private createIdentifier(): string {
    return uuid.v4();
  }

  private createActivityStream(): IActivityStream {
    return {
      "@context": "https://www.w3.org/ns/activitystreams",
      "generator": {
        id: this.serviceID,
        name: this.generatorName,
        type: "Service",
      },
      "published": Math.floor(Date.now() / 1000),
      "type": "Create",
    };
  }
}
