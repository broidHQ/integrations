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

import * as messengerMessage from './fixtures/messenger/message.json';
import * as messengerMessageImage from './fixtures/messenger/messageImage.json';
import * as messengerMessageInteractiveCallback from './fixtures/messenger/messageInteractiveCallback.json';
import * as messengerMessageLink from './fixtures/messenger/messageLink.json';
import * as messengerMessageLocation from './fixtures/messenger/messageLocation.json';

import * as broidMessageNormalized from './fixtures/broid/normalized/message.json';
import * as broidMessageNormalizedImage from './fixtures/broid/normalized/messageImage.json';
import * as broidMessageNormalizedInteractiveCallback from './fixtures/broid/normalized/messageInteractiveCallback.json';
import * as broidMessageNormalizedLink from './fixtures/broid/normalized/messageLink.json';
import * as broidMessageNormalizedLocation from './fixtures/broid/normalized/messageLocation.json';

import * as broidMessage from './fixtures/broid/parsed/message.json';
import * as broidMessageImage from './fixtures/broid/parsed/messageImage.json';
import * as broidMessageInteractiveCallback from './fixtures/broid/parsed/messageInteractiveCallback.json';
import * as broidMessageLink from './fixtures/broid/parsed/messageLink.json';
import * as broidMessageLocation from './fixtures/broid/parsed/messageLocation.json';

const author = {
  first_name: 'Issam',
  id: '1326232313',
  last_name: 'Killix',
  name: 'Issam Hakimi Killix',
};

let parser: Parser;
ava.before(() => {
  parser = new Parser('messenger', 'test_service', 'info');
});

ava('Parse a null', async (t) => {
  const data = parser.parse(null);
  t.deepEqual(await data, null);
});

ava('Normalize a simple message', async (t) => {
  const data = parser.normalize(<any> messengerMessage);
  t.deepEqual(await data, broidMessageNormalized);
});

ava('Normalize a message with image', async (t) => {
  const data = parser.normalize(<any> messengerMessageImage);
  t.deepEqual(await data, broidMessageNormalizedImage);
});

ava('Normalize a message with link', async (t) => {
  const data = parser.normalize(<any> messengerMessageLink);
  t.deepEqual(await data, broidMessageNormalizedLink);
});

ava('Normalize a interactive message callback', async (t) => {
  const data = parser.normalize(<any> messengerMessageInteractiveCallback);
  t.deepEqual(await data, broidMessageNormalizedInteractiveCallback);
});

ava('Normalize a location message', async (t) => {
  const data = parser.normalize(<any> messengerMessageLocation);
  t.deepEqual(await data, broidMessageNormalizedLocation);
});

ava('Parse a simple message', async (t) => {
  const r: any = Object.assign({}, broidMessageNormalized[0]);
  r.authorInformation = author;
  const data = parser.parse(r);
  t.deepEqual(await data, broidMessage);
});

ava('Parse a message with image', async (t) => {
  const r: any = Object.assign({}, broidMessageNormalizedImage[0]);
  r.authorInformation = author;
  const data = parser.parse(r);
  t.deepEqual(await data, broidMessageImage);
});

ava('Parse a message with link', async (t) => {
  const r: any = Object.assign({}, broidMessageNormalizedLink[0]);
  r.authorInformation = author;
  const data = parser.parse(r);
  t.deepEqual(await data, broidMessageLink);
});

ava('Parse a interactive message callback', async (t) => {
  const r: any = Object.assign({}, broidMessageNormalizedInteractiveCallback[0]);
  r.authorInformation = author;
  const data = parser.parse(r);
  t.deepEqual(await data, broidMessageInteractiveCallback);
});

ava('Parse a location message', async (t) => {
  const r: any = Object.assign({}, broidMessageNormalizedLocation[0]);
  r.authorInformation = author;
  const data = parser.parse(r);
  t.deepEqual(await data, broidMessageLocation);
});

ava('Validate a simple message', async (t) => {
  const data = parser.validate(broidMessage);
  t.deepEqual(await data, broidMessage);
});

ava('Validate a message with image', async (t) => {
  const data = parser.validate(broidMessageImage);
  t.deepEqual(await data, broidMessageImage);
});

ava('Validate a message with link', async (t) => {
  const data = parser.validate(broidMessageLink);
  t.deepEqual(await data, broidMessageLink);
});

ava('Validate a interactive message callback', async (t) => {
  const data = parser.validate(broidMessageInteractiveCallback);
  t.deepEqual(await data, broidMessageInteractiveCallback);
});

ava('Validate a location message', async (t) => {
  const data = parser.validate(broidMessageLocation);
  t.deepEqual(await data, broidMessageLocation);
});
