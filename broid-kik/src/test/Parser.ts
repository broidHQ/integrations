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

import * as kikMessage from './fixtures/kik/message.json';
import * as kikMessageImage from './fixtures/kik/messageImage.json';
import * as kikMessageInteractiveCallback from './fixtures/kik/messageInteractiveCallback.json';
import * as kikMessageVideo from './fixtures/kik/messageVideo.json';

import * as broidMessageNormalized from './fixtures/broid/normalized/message.json';
import * as broidMessageNormalizedImage from './fixtures/broid/normalized/messageImage.json';
import * as broidMessageNormalizedInteractiveCallback from './fixtures/broid/normalized/messageInteractiveCallback.json';
import * as broidMessageNormalizedVideo from './fixtures/broid/normalized/messageVideo.json';

import * as broidMessage from './fixtures/broid/parsed/message.json';
import * as broidMessageImage from './fixtures/broid/parsed/messageImage.json';
import * as broidMessageInteractiveCallback from './fixtures/broid/parsed/messageInteractiveCallback.json';
import * as broidMessageVideo from './fixtures/broid/parsed/messageVideo.json';

const userInformation: any = {
  displayName: 'Issam H.',
  firstName: 'Issam',
  id: 'killix',
  lastName: 'H.',
  profilePicLastModified: null,
  profilePicUrl: null,
  username: 'killix',
};

let parser: Parser;
ava.before(() => {
  parser = new Parser('kik', 'test_service', 'info');
});

ava('Parse a null', async (t) => {
  const data = parser.parse(null);
  t.deepEqual(await data, null);
});

ava('Normalize a simple message', async (t) => {
  const data = parser.normalize(<any> kikMessage, userInformation);
  t.deepEqual(await data, broidMessageNormalized);
});

ava('Normalize a message with image', async (t) => {
  const data = parser.normalize(<any> kikMessageImage, userInformation);
  t.deepEqual(await data, broidMessageNormalizedImage);
});

ava('Normalize a message with video', async (t) => {
  const data = parser.normalize(<any> kikMessageVideo, userInformation);
  t.deepEqual(await data, broidMessageNormalizedVideo);
});

ava('Normalize a interactive message callback', async (t) => {
  const data = parser.normalize(<any> kikMessageInteractiveCallback, userInformation);
  t.deepEqual(await data, broidMessageNormalizedInteractiveCallback);
});

ava('Parse a simple message', async (t) => {
  const data = parser.parse(broidMessageNormalized);
  t.deepEqual(await data, broidMessage);
});

ava('Parse a message with image', async (t) => {
  const data = parser.parse(broidMessageNormalizedImage);
  t.deepEqual(await data, broidMessageImage);
});

ava('Parse a message with video', async (t) => {
  const data = parser.parse(broidMessageNormalizedVideo);
  t.deepEqual(await data, broidMessageVideo);
});

ava('Parse a interactive message callback', async (t) => {
  const data = parser.parse(broidMessageNormalizedInteractiveCallback);
  t.deepEqual(await data, broidMessageInteractiveCallback);
});

ava('Validate a simple message', async (t) => {
  const data = parser.validate(broidMessage);
  t.deepEqual(await data, broidMessage);
});

ava('Validate a message with image', async (t) => {
  const data = parser.validate(broidMessageImage);
  t.deepEqual(await data, broidMessageImage);
});

ava('Validate a private message with video', async (t) => {
  const data = parser.validate(broidMessageVideo);
  t.deepEqual(await data, broidMessageVideo);
});

ava('Validate a interactive message callback', async (t) => {
  const data = parser.validate(broidMessageInteractiveCallback);
  t.deepEqual(await data, broidMessageInteractiveCallback);
});
