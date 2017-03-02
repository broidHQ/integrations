import * as Promise from "bluebird";
import broidSchemas, { IActivityStream } from "broid-schemas";
import { cleanNulls, Logger } from "broid-utils";
import * as R from "ramda";

export default class Parser {
  public generatorName: string;
  public serviceID: string;
  private logger: Logger;
  private userCache: Object;
  private wechatClient: any;

  constructor(wechatClient: any, serviceID: string, logLevel: string) {
    this.generatorName = "wechat";
    this.serviceID = serviceID;
    this.logger = new Logger("parser", logLevel);
    this.userCache = {};
    this.wechatClient = wechatClient;
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
  public parse(event: Object): Promise<IActivityStream | null> {
    this.logger.debug("Normalized process");

    const normalized = cleanNulls(event);
    if (!normalized || R.isEmpty(normalized)) { return Promise.resolve(null); }

    switch (normalized.msgtype[0]) {
      case "image":
        return this.parseImage(normalized);
      case "text":
        return this.parseText(normalized);
      case "video":
        return this.parseMultiMedia(normalized, "Video");
      case "voice":
        return this.parseMultiMedia(normalized, "Audio");
      default:
        return Promise.resolve(null);
    }
  }

  private getUserName(openid: string): Promise<String> {
    if (this.userCache[openid]) {
      return Promise.resolve(this.userCache[openid]);
    }

    return this.wechatClient.getUserAsync(openid)
      .then(({nickname}) => {
        this.userCache[openid] = nickname;
        return nickname;
      });
  }

  private createActivityStream(normalized: any): Promise<IActivityStream> {
    return this.getUserName(normalized.fromusername[0])
      .then((nickname: string) => {
        const message: IActivityStream = {
          "@context": "https://www.w3.org/ns/activitystreams",
          "actor": {
            id: normalized.fromusername[0],
            name: nickname,
            type: "Person",
          },
          "generator": {
            id: this.serviceID,
            name: this.generatorName,
            type: "Service",
          },
          "object": {},
          "published": parseInt(normalized.createtime[0], 10),
          "target": {
            id: normalized.tousername[0],
            name: normalized.tousername[0],
            type: "Person",
          },
          "type": "Create",
        };

        return message;
      });
  }

  private parseImage(normalized: any): Promise<IActivityStream> {
    return this.createActivityStream(normalized)
      .then((message: IActivityStream) => {
        message.object = {
          id: normalized.msgid[0],
          type: "Image",
          url: normalized.picurl[0],
        };
        return message;
      });
  }

  private parseText(normalized: any): Promise<IActivityStream> {
    return this.createActivityStream(normalized)
      .then((message: IActivityStream) => {
        message.object = {
          content: normalized.content[0],
          id: normalized.msgid[0],
          type: "Note",
        };
        return message;
      });
  }

  private parseMultiMedia(normalized: any, messageType: string): Promise<IActivityStream> {
    const getAccessToken = this.wechatClient.getLatestTokenAsync()
      .then(R.prop("accessToken"));

    return Promise.join(getAccessToken, this.createActivityStream(normalized))
      .spread((accessToken: string, message: IActivityStream) => {
        message.object = {
          id: normalized.msgid[0],
          type: messageType,
          url: `http://file.api.wechat.com/cgi-bin/media/get?access_token=${accessToken}&media_id=${normalized.mediaid[0]}`,
        };

        return message;
      });
  }
}
