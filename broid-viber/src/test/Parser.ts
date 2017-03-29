import ava from 'ava';
import { Parser } from '../core/Parser';

import * as broidMessage from './fixtures/broid/message.json';
import * as broidMessageInteractiveCallback from './fixtures/broid/messageInteractiveCallback.json';
import * as broidMessageLocation from './fixtures/broid/messageLocation.json';
import * as broidMessageNorm from './fixtures/broid/messageNormalized.json';
import * as broidMessageNormInteraCallback from './fixtures/broid/messageNormalizedInteractiveCallback.json';
import * as broidMessageNormLocation from './fixtures/broid/messageNormalizedLocation.json';
import * as broidMessageNormWithMedia from './fixtures/broid/messageNormalizedWithMedia.json';
import * as broidMessageWithMedia from './fixtures/broid/messageWithMedia.json';
import * as viberMessage from './fixtures/viber/message.json';
import * as viberMessageInteractiveCallback from './fixtures/viber/messageInteractiveCallback.json';
import * as viberMessageLocation from './fixtures/viber/messageLocation.json';
import * as viberMessageWithMedia from './fixtures/viber/messageWithMedia.json';

const targetMe = {
  _isMe: true,
  category: 'Companies, Brands & Products',
  country: 'CA',
  event_types: [
    'subscribed',
    'unsubscribed',
    'conversation_started',
    'delivered',
    'message',
    'seen',
  ],
  icon: 'https://media-direct.cdn.viber.com/pg_download?' +
    'pgtp=icons&dlid=0-04-01-f6683bfa60198d661e0ed02c81065' +
    'b7825b069a0c5c3aaae106248292653f704&fltp=jpg&imsz=0000',
  id: 'pa:4995190299521361547',
  location: {
    lat: 45.5308397,
    lon: -73.5538878,
  },
  members: [
    {
      id: '8GBW4nlCwfAk8SQm3zmcAA==',
      name: 'Killix',
      role: 'admin',
    },
  ],
  name: 'Killix',
  status: 0,
  status_message: 'ok',
  subcategory: 'Apps & Utilities',
  subscribers_count: 1,
  uri: 'killix',
  webhook: 'https://09566bf5.ngrok.io/',
};

let parser: Parser;
ava.before(() => {
  parser = new Parser('viber', 'test_service', 'info');
});

ava('Parse null', async (t) => {
  const data = parser.parse(null);
  t.is(await data, null);
});

ava('Normalize null', async (t) => {
  const data = parser.normalize(null);
  t.is(await data, null);
});

ava('Normalize a simple message', async (t) => {
  const data = parser.normalize(viberMessage as any);
  t.deepEqual(await data, broidMessageNorm);
});

ava('Normalize a location message', async (t) => {
  const data = parser.normalize(viberMessageLocation as any);
  t.deepEqual(await data, broidMessageNormLocation);
});

ava('Normalize a interactive message callback', async (t) => {
  const data = parser.normalize(viberMessageInteractiveCallback as any);
  t.deepEqual(await data, broidMessageNormInteraCallback);
});

ava('Normalize a message with media', async (t) => {
  const data = parser.normalize(viberMessageWithMedia as any);
  t.deepEqual(await data, broidMessageNormWithMedia);
});

ava('Parse a simple message', async (t) => {
  const broidWithTarget: any = Object.assign({}, broidMessageNorm);
  broidWithTarget.target = targetMe;
  const data = parser.parse(broidWithTarget);
  t.deepEqual(await data, broidMessage);
});

ava('Parse a location message', async (t) => {
  const broidWithTarget: any = Object.assign({}, broidMessageNormLocation);
  broidWithTarget.target = targetMe;
  const data = parser.parse(broidWithTarget);
  t.deepEqual(await data, broidMessageLocation);
});

ava('Parse a interactive message callback', async (t) => {
  const broidWithTarget: any = Object.assign({}, broidMessageNormInteraCallback);
  broidWithTarget.target = targetMe;
  const data = parser.parse(broidWithTarget);
  t.deepEqual(await data, broidMessageInteractiveCallback);
});

ava('Parse a message with media', async (t) => {
  const broidWithTarget: any = Object.assign({}, broidMessageNormWithMedia);
  broidWithTarget.target = targetMe;
  const data = parser.parse(broidWithTarget);
  t.deepEqual(await data, broidMessageWithMedia);
});

ava('Validate a simple message', async (t) => {
  const data = parser.validate(broidMessage);
  t.deepEqual(await data, broidMessage);
});

ava('Validate a location message', async (t) => {
  const data = parser.validate(broidMessageLocation);
  t.deepEqual(await data, broidMessageLocation);
});

ava('Validate a interactive message callback', async (t) => {
  const data = parser.validate(broidMessageInteractiveCallback);
  t.deepEqual(await data, broidMessageInteractiveCallback);
});

ava('Validate a message  with media', async (t) => {
  const data = parser.validate(broidMessageWithMedia);
  t.deepEqual(await data, broidMessageWithMedia);
});
