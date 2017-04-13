import {
  default as schemas,
  IActivityStream,
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
  public validate(event: any): Promise<any> {
    this.logger.debug('Validation process', { event });

    const parsed = cleanNulls(event);
    if (!parsed || R.isEmpty(parsed)) { return Promise.resolve(null); }

    if (!parsed.type) {
      this.logger.debug('Type not found.', { parsed });
      return Promise.resolve(null);
    }

    return schemas(parsed, 'activity')
      .then(() => parsed)
      .catch((err: any) => {
        this.logger.error(err);
        return null;
      });
  }

  // Convert normalized data to Broid schema
  public parse(event: any): Promise<IActivityStream | null> {
    this.logger.debug('Normalize process', { event });

    const normalized = cleanNulls(event);
    if (!normalized || R.isEmpty(normalized)) { return Promise.resolve(null); }

    const activitystreams = this.createActivityStream(normalized);
    activitystreams.actor = {
      id: R.path(['author', 'id'], normalized),
      name: R.path(['author', 'name'], normalized),
      type: 'Person',
    };

    // Note: we ignore the target data if the message is send to the public page
    if (R.path(['target', '_isMe'], normalized)) {
      activitystreams.target = activitystreams.actor;
    } else {
      activitystreams.target = {
        id: R.path(['target', 'name'], normalized),
        name: R.path(['target', 'name'], normalized),
        type: R.path(['target', '_isMe'], normalized) ? 'Application' : 'Person',
      };
    }

    const content = normalized.text;
    const id = normalized.token.toString() || this.createIdentifier();

    return Promise.resolve(activitystreams)
      .then((as2) => {
        if (normalized.url && (normalized.type === 'Image' || normalized.type === 'Video')) {
          return fileInfo(normalized.url.split('?')[0])
            .then((infos) => {
              as2.object = {
                id,
                mediaType: infos.mimetype,
                type: normalized.type,
                url: normalized.url,
              };

              return as2;
            });
        } else if (normalized.type === 'Place') {
          as2.object = {
            id,
            latitude: normalized.latitude,
            longitude: normalized.longitude,
            type: 'Place',
          };
        }

        return as2;
      })
      .then((as2) => {
        if (content && !R.isEmpty(content)) {
          if (as2.object && !R.isEmpty(as2.object)) {
            as2.object.content = content;
          } else {
            as2.object = { content, id, type: 'Note' };
          }
        }

        return as2;
      });
  }

  // Normalize the raw event
  public normalize(evt: any): Promise<any> {
    this.logger.debug('Event received to normalize');

    const event = cleanNulls(evt);
    if (!event || R.isEmpty(event) || R.path(['message', 'stickerId'], evt)) {
      return Promise.resolve(null);
    }

    const author = event.user_profile;
    const latitude = R.path(['message', 'latitude'], event);
    const longitude = R.path(['message', 'longitude'], event);
    const text = R.path(['message', 'text'], event);
    const timestamp = R.path(['message', 'timestamp'], event);
    const token = R.path(['message', 'token'], event);
    const url: string = R.path(['message', 'url'], event) as string;

    const data: any = {
      author,
      token,
      timestamp,
      type: 'Note',
    };

    if (text) { data.text = text; }

    if (url) {
      let mType: string = '';
      if (url.indexOf('sig/video') !== -1) { mType = 'Video'; }
      if (url.indexOf('sig/image') !== -1) { mType = 'Image'; }

      data.type = mType;
      data.url = url;
    } else if (latitude && longitude) {
      data.type = 'Place';
      data.latitude = latitude;
      data.longitude = longitude;
    }

    return Promise.resolve(data);
  }

  private createIdentifier(): string {
    return uuid.v4();
  }

  private createActivityStream(normalized: any): IActivityStream {
    return {
      '@context': 'https://www.w3.org/ns/activitystreams',
      'actor': {},
      'generator': {
        id: this.serviceID,
        name: this.generatorName,
        type: 'Service',
      },
      'object': {},
      'published': normalized.timestamp ?
        Math.floor(normalized.timestamp / 1000)
        : Math.floor(Date.now() / 1000),
      'target': {},
      'type': 'Create',
    };
  }
}
