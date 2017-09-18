import schemas from '@broid/schemas';
import { fileInfo, Logger } from '@broid/utils';

import * as Promise from 'bluebird';
import * as botbuilder from 'botbuilder';
import { Router } from 'express';
import * as R from 'ramda';
import { Observable } from 'rxjs/Rx';
import * as uuid from 'uuid';

import { IAdapterOptions } from './interfaces';
import { Parser } from './Parser';
import { WebHookServer } from './WebHookServer';

export class Adapter {
  private connected: boolean;
  private logLevel: string;
  private logger: Logger;
  private parser: Parser;
  private router: Router;
  private serviceID: string;
  private storeUsers: Map<string, object>;
  private storeAddresses: Map<string, object>;
  private token: string | null;
  private tokenSecret: string | null;
  private webhookServer: WebHookServer;
  private session: botbuilder.UniversalBot;
  private sessionConnector: botbuilder.ChatConnector;

  constructor(obj: IAdapterOptions) {
    this.serviceID = obj && obj.serviceID || uuid.v4();
    this.logLevel = obj && obj.logLevel || 'info';
    this.router = Router();
    this.token = obj && obj.token || null;
    this.tokenSecret = obj && obj.tokenSecret || null;
    this.storeUsers = new Map();
    this.storeAddresses = new Map();

    this.parser = new Parser(this.serviceName(), this.serviceID, this.logLevel);
    this.logger = new Logger('adapter', this.logLevel);

    if (obj.http) {
      this.webhookServer = new WebHookServer(obj.http, this.router, this.logLevel);
    }
  }

  // Return list of users information
  public users(): Promise<Map<string, object>> {
    return Promise.resolve(this.storeUsers);
  }

  // Return list of channels information
  public channels(): Promise<Error> {
    return Promise.reject(new Error('Not supported'));
  }

  public addresses(id: string): Promise<object | Error>  {
    const data = this.storeAddresses.get(id);
    if (data) {
      return Promise.resolve(data);
    }

    return Promise.reject(new Error(`Address ${id} not found`));
  }

  // Return the service ID of the current instance
  public serviceId(): string {
    return this.serviceID;
  }

  public serviceName(): string {
    return 'ms-teams';
  }

  public getRouter(): Router | null {
    if (this.webhookServer) {
      return null;
    }
    return this.router;
  }

  // Connect to Skype
  // Start the webhook server
  public connect(): Observable<object> {
    if (this.connected) {
      return Observable.of({ type: 'connected', serviceID: this.serviceId() });
    }

    if (!this.token || !this.tokenSecret) {
      return Observable.throw(new Error('Credentials should exist.'));
    }

    this.sessionConnector = new botbuilder.ChatConnector({
      appId: this.token,
      appPassword: this.tokenSecret,
    });

    this.session = new botbuilder.UniversalBot(this.sessionConnector);
    // Router setup happens on connect, however getRouter can still be called before.
    this.router.post('/', this.sessionConnector.listen());
    if (this.webhookServer) {
      this.webhookServer.listen();
    }

    this.connected = true;
    return Observable.of({ type: 'connected', serviceID: this.serviceId() });
  }

  public disconnect(): Promise<null> {
    this.connected = false;
    if (this.webhookServer) {
      return this.webhookServer.close();
    }

    return Promise.resolve(null);
  }

  // Listen 'message' event from Messenger
  public listen(): Observable<object> {
    return Observable.create((observer) => {
      this.session.dialog('/', (event) => {
        this.storeAddresses.set(
          R.path(['message', 'address', 'id'], event) as string,
          R.path(['message', 'address'], event) as object);
        this.storeUsers.set(
          R.path(['message', 'user', 'id'], event) as string,
          R.path(['message', 'user'], event) as object);

        return Promise.resolve(event.message)
          .then((normalized) => this.parser.parse(normalized))
          .then((parsed) => this.parser.validate(parsed))
          .then((validated) => {
            if (validated) { return observer.next(validated); }
            return null;
          })
          .catch((error) => {
            this.logger.error(error);
            return Observable.empty();
          });
      });
    });
  }

  public send(data: object): Promise<object> {
    this.logger.debug('sending', { message: data });
    return schemas(data, 'send')
      .then(() => {
        const context: string = R.path(['object', 'context', 'content'], data) as string;
        const content: string = R.path(['object', 'content'], data) as string;
        const name: string = R.path(['object', 'name'], data) as string;
        const objectType: string = R.path(['object', 'type'], data) as string;

        const contextArr = R.split('#', context);
        const addressID = contextArr[0];

        let address = this.storeAddresses.get(addressID);
        if (!address) {
          if (R.length(contextArr) !== 4) {
            const errorFormMsg = 'address.id#address.conversation.id#channelId#bot.id';
            const errorMsg = 'Context value should use the form:';
            return Promise.reject(new Error(`${errorMsg} ${errorFormMsg}`));
          }

          const conversationID = contextArr[1];
          const channelID = contextArr[2];
          const botID = contextArr[3];
          const userID = R.path(['to', 'id'], data);

          address = {
            bot: { id: botID },
            channelId: channelID,
            conversation: { id: conversationID },
            id: addressID,
            serviceUrl: `https://${channelID}.botframework.com`,
            useAuth: true,
            user: { id: userID },
          };
        }

        // Process attachment
        const attachmentButtons = R.filter(
          (attachment: any) => attachment.type === 'Button',
          R.path(['object', 'attachment'], data) as any[] || []);

        const messageButtons = R.map(
          (button) => {
            return new botbuilder.CardAction().type('imBack').value(button.url)
              .title(button.name || button.content || 'Click to send response to bot');
          },
          attachmentButtons);

        let messageAttachments: any[] = [];
        const messageBuilder = new botbuilder.Message()
          .textFormat(botbuilder.TextFormat.markdown)
          .address(address as botbuilder.IAddress);

        if (objectType === 'Note') {
          if (!messageButtons) {
            messageBuilder.text(content);
          } else {
            messageAttachments = [
              new botbuilder.HeroCard().title(name).text(content).buttons(messageButtons),
            ];
          }

          messageBuilder.attachments(messageAttachments);
          return messageBuilder;
        } else if (objectType === 'Image' || objectType === 'Video') {
          const url: string = R.path(['object', 'url'], data) as string;
          const hero = new botbuilder.HeroCard().title(name).text(content);

          if (messageButtons) { hero.buttons(messageButtons); }

          if (objectType === 'Image') {
            hero.images([new botbuilder.CardImage().url(url)]);
            messageAttachments = [hero];

            messageBuilder.attachments(messageAttachments);
            return messageBuilder;
          } else {
            return fileInfo(url, this.logger)
              .then((infos) => {
                messageAttachments = [{ contentType: infos.mimetype, contentUrl: url }, hero];
                messageBuilder.attachments(messageAttachments);
                return messageBuilder;
              });
          }
        }

        throw new Error('Only Note, Image, and Video are supported.');
      })
      .then((builder) => Promise.fromCallback((cb) => this.session.send(builder, cb))
        .then(() => ({ serviceID: this.serviceId(), type: 'sent' })));
  }
}
