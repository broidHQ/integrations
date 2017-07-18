import { default as schemas, IActivityStream } from '@broid/schemas';
import { cleanNulls, Logger } from '@broid/utils';

import * as Promise from 'bluebird';
import * as moment from 'moment';
import * as R from 'ramda';
import * as uuid from 'uuid';

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
    this.logger.debug('Normalize process', { event });

    const normalized = cleanNulls(event);
    if (!normalized || R.isEmpty(normalized)) { return Promise.resolve(null); }

    const activitystreams = this.createActivityStream(normalized);

    activitystreams.actor = {
      id:  normalized.msisdn,
      name: normalized.msisdn,
      type: 'Person',
    };

    activitystreams.target = {
      id:  normalized.to,
      name: normalized.to,
      type: 'Person',
    };

    activitystreams.object = {
      content: normalized.text,
      id: normalized.messageId || this.createIdentifier(),
      type: 'Note',
    };

    return Promise.resolve(activitystreams);
  }

  private createIdentifier(): string {
    return uuid.v4();
  }

  private createActivityStream(event: any): IActivityStream {
    let timestamp = moment().unix();
    if (event.timestamp) {
      timestamp = moment.utc(event.timestamp, 'YYYY-MM-DD HH:mm:ss', true)
        .unix();
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
