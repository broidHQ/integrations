import * as Bluebird from 'bluebird';
import * as localtunnel from 'localtunnel';
import * as nconf from 'nconf';
import * as net from 'net';
import * as R from 'ramda';

import './config';
import { intConfigs } from './integration_configs';

import { IASBase, IASObject, ISendParameters } from '@broid/schemas';
import { IConfigTemplate, IIntegrationConfigs } from './interfaces';

const localtunnelAsync: any = Bluebird.promisify(localtunnel);

const NOTE_OBJECT = {
  content: 'Hello World!',
  type: 'Note',
};

const IMAGE_OBJECT = {
  content: 'image.jpg',
  type: 'Image',
  url: 'https://raw.githubusercontent.com/broidHQ/mediaelement-files/master/big_buck_bunny.jpg',
};

const VIDEO_OBJECT = {
  content: 'video.mp4',
  type: 'Video',
  url: 'https://raw.githubusercontent.com/broidHQ/mediaelement-files/master/echo-hereweare.mp4',
};

async function getRandomPort(): Promise<Number> {
  return Bluebird.fromCallback((cb) => {
    const server = net.createServer((sock) => {
      sock.end('Hello world\n');
    });

    server.listen(0, () => {
      const port = server.address().port;
      server.close();
      return cb(null, port);
    });
  });
}

function generateMessage(bot: any, messageObject: IASObject, to: IASBase): ISendParameters {
  const formattedMessage: ISendParameters = {
    '@context': 'https://www.w3.org/ns/activitystreams',
    'generator': {
      id: bot.serviceId(),
      name: bot.serviceName(),
      type: 'Service',
    },
    'object': messageObject,
    to,
    'type': 'Create',
  };

  return formattedMessage;
}

function mapConfig(name: string, configTemplate: any, instanceInt: Number): IConfigTemplate {
  const mappedConfig: IConfigTemplate = R.map((val) => {
    if (R.is(String, val)) {
      return nconf.get(`${name.toUpperCase()}_${instanceInt}_${val}`);
    }
    return val;
  }, configTemplate);

  return mappedConfig;
}

async function createBotInstance(config: IIntegrationConfigs, instanceInt: Number): Promise<any> {
  return Bluebird.fromCallback(async (cb) => {
    const adapterConfig = mapConfig(config.name, config.configTemplate, instanceInt);
    if (adapterConfig.http) {
      adapterConfig.http.port = await getRandomPort();
    }
    const adapter = new config.Adapter(adapterConfig);

    if (config.localtunnelPrefix && adapterConfig.http) {
      adapter.localtunnel = await localtunnelAsync(adapterConfig.http.port, {
        subdomain: nconf.get(`${config.name.toUpperCase()}_${instanceInt}_LOCALTUNNEL`),
      });
    }

    adapter.connect()
      .subscribe({
        error: (err) => cb(err),
        next: (data) => {
          if (data.type === 'connected') {
            return cb(null, adapter);
          }
        },
      });
  });
}

async function createBotInstances(config: IIntegrationConfigs): Promise<any> {
  return Bluebird.join(
    createBotInstance(config, 1),
    createBotInstance(config, 2),
  );
}

async function listenForMessageBounce(bot1: any, bot2: any, messageObject: IASObject, to: IASBase): Promise<null> {
  return Bluebird.fromCallback((cb) => {
    const message = generateMessage(bot2, messageObject, to);
    bot1.listen()
      .subscribe({
        error: (err) => {
          cb(err);
        },
        next: (data) => {
          if (data.object.type === message.object.type) {
            cb(null);
          }
        },
      });

    bot2.send(message)
      .catch(cb);
  })
  .timeout(30000); // Message bounce must complete within timeframe before an error is thrown
}

// TODO: Maybe make this async and collect results afterwards?
intConfigs.forEach(async (config: IIntegrationConfigs) => {
  const [bot1, bot2] = await createBotInstances(config);

  console.log(`[${config.name}] Bots connected`);

  if (config.tests.message) {
    console.log(`[${config.name}] Testing first message bounce`);
    await listenForMessageBounce(bot1, bot2, NOTE_OBJECT, config.to);

    console.log(`[${config.name}] Testing second message bounce`);
    await listenForMessageBounce(bot2, bot1, NOTE_OBJECT, config.to);
  }

  if (config.tests.image) {
    console.log(`[${config.name}] Testing first image message bounce`);
    await listenForMessageBounce(bot1, bot2, IMAGE_OBJECT, config.to);

    console.log(`[${config.name}] Testing second image message bounce`);
    await listenForMessageBounce(bot2, bot1, IMAGE_OBJECT, config.to);
  }

  if (config.tests.video) {
    console.log(`[${config.name}] Testing first video message bounce`);
    await listenForMessageBounce(bot1, bot2, VIDEO_OBJECT, config.to);

    console.log(`[${config.name}] Testing second video message bounce`);
    await listenForMessageBounce(bot2, bot1, VIDEO_OBJECT, config.to);
  }

  console.log(`[${config.name}] Disconnecting`);
  [bot1, bot2].forEach((bot) => {
    if (bot.localtunnel) {
      bot.localtunnel.disconnect();
    }
    bot.disconnect();
  });
});
