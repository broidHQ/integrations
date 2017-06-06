import {
  default as schemas,
  IActivityStream,
  IASContext,
} from '@broid/schemas';
import { cleanNulls, fileInfo, Logger } from '@broid/utils';

import * as Promise from 'bluebird';
import * as uuid from 'node-uuid';
import * as R from 'ramda';

export class Parser {
  public serviceID: string;
  public generatorName: string;
  private logger: Logger;

  constructor(serviceName: string, serviceID: string, logLevel: string) {
    this.serviceID = serviceID;
    this.generatorName = serviceName;
    this.logger = new Logger('parser', logLevel);
  }

  // Validate parsed data with Broid schema validator
  public validate(event: any): Promise<IActivityStream | null> {
    this.logger.debug('Validation process', { event });

    const parsed = cleanNulls(event);
    if (!parsed || R.isEmpty(parsed)) { return Promise.resolve(null); }

    if (!parsed.type) {
      this.logger.debug('Type not found.', { parsed });
      return Promise.resolve(null);
    }

    return schemas(parsed, 'activity')
      .then(() => parsed)
      .catch((err) => {
        this.logger.error(err);
        return null;
      });
  }

  // Convert normalized data to Broid schema
  public parse(event: any): Promise<IActivityStream> {
    this.logger.debug('Parse process', { event });

    const normalized = cleanNulls(event);
    if (!normalized || R.isEmpty(normalized)) { return Promise.resolve(null); }

    const activitystreams = this.createActivityStream(normalized);
    activitystreams.actor = {
      id: R.path(['user', 'id'], normalized),
      name: R.path(['user', 'name'], normalized),
      type: 'Person',
    };

    activitystreams.target = {
      id: R.path(['address', 'bot', 'name'], normalized),
      name: R.path(['address', 'bot', 'name'], normalized),
      type: 'Person',
    };

    const addressID = R.path(['address', 'id'], normalized);
    const addressChannelID = R.path(['address', 'channelId'], normalized);
    const addressConversationID = R.path(['address', 'conversation', 'id'], normalized);
    const addressBotID = R.path(['address', 'conversation', 'id'], normalized);
    const context: IASContext = {
      content: `${addressID}#${addressConversationID}#${addressChannelID}#${addressBotID}`,
      name: 'address_id',
      type: 'Object',
    };

    // Process potentially media.
    const attachmentImages = R.filter(
      (attachment: any) => attachment.contentType.startsWith('image'),
      normalized.attachments);
    const attachmentVideos = R.filter(
      (attachment: any) => attachment.contentType.startsWith('video')
        || attachment.contentType === 'application/octet-stream',
      normalized.attachments);

    const assoc = (attachment, infos, fileType) => R.assoc(
      'name',
      attachment.name,
      R.assoc(
        'contentUrl',
        attachment.contentUrl,
        R.assoc(
          'fileType',
          fileType,
          infos,
        ),
      ),
    );

    return Promise.map(attachmentImages, (attachment) =>
      fileInfo(attachment.name, this.logger).then((infos) => assoc(attachment, infos, 'Image')))
      .then((dataImages) =>
        Promise.map(attachmentVideos, (attachment) =>
          fileInfo(attachment.name, this.logger).then((infos) => assoc(attachment, infos, 'Video')))
        .then((dataVideos) => R.concat(dataImages, dataVideos)))
      .then((fileInfos) => {
        const count = R.length(fileInfos);
        if (count === 1) {
          activitystreams.object = {
            content: normalized.text,
            context,
            id: addressID || this.createIdentifier(),
            mediaType: fileInfos[0].mimetype,
            name: fileInfos[0].name,
            type: fileInfos[0].fileType,
            url: fileInfos[0].contentUrl,
          };
        } else if (count > 1) {
          activitystreams.object = {
            attachment: R.map((info) => ({
              mediaType: info.mimetype,
              name: info.name,
              type: info.fileType,
              url: info.contentUrl,
            }), fileInfos),
            content: normalized.text,
            id: addressID || this.createIdentifier(),
            type: 'Note',
          };
        }

        return activitystreams;
      })
      .then((as2) => {
        if (!as2.object && !R.isEmpty(normalized.text)) {
          activitystreams.object = {
            content: normalized.text,
            context,
            id: addressID || this.createIdentifier(),
            type: 'Note',
          };
        }

        return as2;
      });
  }

  private createIdentifier(): string {
    return uuid.v4();
  }

  private createActivityStream(normalized: any): IActivityStream {
    let timestamp = Math.floor(Date.now() / 1000);
    if (normalized.timestamp) {
      const dateCreatedAt = new Date(normalized.timestamp);
      timestamp = dateCreatedAt.getTime();
    }

    return {
      '@context': 'https://www.w3.org/ns/activitystreams',
      'generator': {
        id: this.serviceID,
        name: this.generatorName,
        type: 'Service',
      },
      'published': timestamp,
      'type': 'Create',
    };
  }
}
