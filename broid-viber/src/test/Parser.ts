/**
 * @license
 * Copyright 2017 Broid.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>
 */

import ava from 'ava';
import { Parser } from '../core/Parser';

import * as broidMessage from './fixtures/broid/message.json';
import * as broidMessageInteractiveCallback from './fixtures/broid/messageInteractiveCallback.json';
import * as broidMessageLocation from './fixtures/broid/messageLocation.json';
import * as broidMessageNormalized from './fixtures/broid/messageNormalized.json';
import * as broidMessageNormalizedInteractiveCallback from './fixtures/broid/messageNormalizedInteractiveCallback.json';
import * as broidMessageNormalizedLocation from './fixtures/broid/messageNormalizedLocation.json';
import * as broidMessageNormalizedWithMedia from './fixtures/broid/messageNormalizedWithMedia.json';
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
  const data = parser.normalize(<any> viberMessage);
  t.deepEqual(await data, broidMessageNormalized);
});

ava('Normalize a location message', async (t) => {
  const data = parser.normalize(<any> viberMessageLocation);
  t.deepEqual(await data, broidMessageNormalizedLocation);
});

ava('Normalize a interactive message callback', async (t) => {
  const data = parser.normalize(<any> viberMessageInteractiveCallback);
  t.deepEqual(await data, broidMessageNormalizedInteractiveCallback);
});

ava('Normalize a message with media', async (t) => {
  const data = parser.normalize(<any> viberMessageWithMedia);
  t.deepEqual(await data, broidMessageNormalizedWithMedia);
});

ava('Parse a simple message', async (t) => {
  const broidWithTarget: any = Object.assign({}, broidMessageNormalized);
  broidWithTarget.target = targetMe;
  const data = parser.parse(broidWithTarget);
  t.deepEqual(await data, broidMessage);
});

ava('Parse a location message', async (t) => {
  const broidWithTarget: any = Object.assign({}, broidMessageNormalizedLocation);
  broidWithTarget.target = targetMe;
  const data = parser.parse(broidWithTarget);
  t.deepEqual(await data, broidMessageLocation);
});

ava('Parse a interactive message callback', async (t) => {
  const broidWithTarget: any = Object.assign({}, broidMessageNormalizedInteractiveCallback);
  broidWithTarget.target = targetMe;
  const data = parser.parse(broidWithTarget);
  t.deepEqual(await data, broidMessageInteractiveCallback);
});

ava('Parse a message with media', async (t) => {
  const broidWithTarget: any = Object.assign({}, broidMessageNormalizedWithMedia);
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
