import { default as schemas, IActivityStream } from '@broid/schemas';
import { cleanNulls, Logger } from '@broid/utils';

import * as Promise from 'bluebird';
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
  public validate(event: any): Promise<object | null> {
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
  public parse(event: any): Promise<object | null> {
    this.logger.debug('Normalize process');

    const normalized = cleanNulls(event);
    if (!normalized || R.isEmpty(normalized)) {
      return Promise.resolve(null);
    }

    const activitystreams = this.createActivityStream();

    activitystreams.actor = {
      id:  R.path(['user', 'userId'], normalized),
      name: R.path(['user', 'userId'], normalized),
      type: 'Person',
    };

    activitystreams.target = {
      id:  normalized.messageID,
      name: R.path(['application', 'applicationId'], normalized),
      type: 'Application',
    };

    activitystreams.object = {
      content: normalized.intentName,
      id: normalized.messageID,
      type: 'Note',
    };

    if (!R.isEmpty(normalized.slots)) {
      const slots = normalized.slots;

      let context = R.map(
        (key) => {
          const name = R.path([key, 'name'], slots);
          const value = R.path([key, 'value'], slots);
          if (!value) {
            return null;
          }

          return {
            content: value,
            name,
            type: 'Object',
          };
        },
        R.keys(slots));
      context = R.reject(R.isNil)(context);

      if (R.length(context) > 0) {
        activitystreams.object.context = context;
      }
    }

    return Promise.resolve(activitystreams);
  }

  private createActivityStream(): IActivityStream {
    return {
      '@context': 'https://www.w3.org/ns/activitystreams',
      'generator': {
        id: this.serviceID,
        name: this.generatorName,
        type: 'Service',
      },
      'published': Math.floor(Date.now() / 1000),
      'type': 'Create',
    };
  }
}
