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
import * as broidMessageNormalized from './fixtures/broid/messageNormalized.json';
import * as broidMessageNormalizedWithMedia from './fixtures/broid/messageNormalizedWithMedia.json';
import * as broidMessageNormalizedWithTag from './fixtures/broid/messageNormalizedWithTag.json';
import * as broidMessagePrivate from './fixtures/broid/messagePrivate.json';
import * as broidMessagePrivateNormalized from './fixtures/broid/messagePrivateNormalized.json';
import * as broidMessagePrivateNormalizedWithMedia from './fixtures/broid/messagePrivateNormalizedWithMedia.json';
import * as broidMessagePrivateNormalizedWithTag from './fixtures/broid/messagePrivateNormalizedWithTag.json';
import * as broidMessagePrivateWithMedia from './fixtures/broid/messagePrivateWithMedia.json';
import * as broidMessagePrivateWithTag from './fixtures/broid/messagePrivateWithTag.json';
import * as broidMessageWithMedia from './fixtures/broid/messageWithMedia.json';
import * as broidMessageWithTag from './fixtures/broid/messageWithTag.json';

import * as twitterMessage from './fixtures/twitter/message.json';
import * as twitterMessagePrivate from './fixtures/twitter/messagePrivate.json';
import * as twitterMessagePrivateWithMedia from './fixtures/twitter/messagePrivateWithMedia.json';
import * as twitterMessagePrivateWithTag from './fixtures/twitter/messagePrivateWithTag.json';
import * as twitterMessageWithMedia from './fixtures/twitter/messageWithMedia.json';
import * as twitterMessageWithTag from './fixtures/twitter/messageWithTag.json';

let parser: Parser;
ava.before(() => {
  parser = new Parser('test_service', 'info');
});

ava('Parse null', async (t) => {
  const data = parser.parse(null);
  t.is(await data, null);
});

ava('Normalize a simple message', async (t) => {
  const data = parser.normalize(<any> twitterMessage);
  t.deepEqual(await data, broidMessageNormalized);
});

ava('Normalize a simple message with tag', async (t) => {
  const data = parser.normalize(<any> twitterMessageWithTag);
  t.deepEqual(await data, broidMessageNormalizedWithTag);
});

ava('Normalize a private message with tag', async (t) => {
  const data = parser.normalize(twitterMessagePrivateWithTag);
  t.deepEqual(await data, broidMessagePrivateNormalizedWithTag);
});

ava('Normalize a simple message with media', async (t) => {
  const data = parser.normalize(<any> twitterMessageWithMedia);
  t.deepEqual(await data, broidMessageNormalizedWithMedia);
});

ava('Normalize a private message', async (t) => {
  const data = parser.normalize(<any> twitterMessagePrivate);
  t.deepEqual(await data, broidMessagePrivateNormalized);
});

ava('Normalize a private message with media', async (t) => {
  const data = parser.normalize(<any> twitterMessagePrivateWithMedia);
  t.deepEqual(await data, broidMessagePrivateNormalizedWithMedia);
});

ava('Parse a simple message', async (t) => {
  const data = parser.parse(<any> broidMessageNormalized);
  t.deepEqual(await data, broidMessage);
});

ava('Parse a simple message with media', async (t) => {
  const data = parser.parse(<any> broidMessageNormalizedWithMedia);
  t.deepEqual(await data, broidMessageWithMedia);
});

ava('Parse a simple message with tag', async (t) => {
  const data = parser.parse(<any> broidMessageNormalizedWithTag);
  t.deepEqual(await data, broidMessageWithTag);
});

ava('Parse a private message', async (t) => {
  const data = parser.parse(<any> broidMessagePrivateNormalized);
  t.deepEqual(await data, broidMessagePrivate);
});

ava('Parse a private message with media', async (t) => {
  const data = parser.parse(<any> broidMessagePrivateNormalizedWithMedia);
  t.deepEqual(await data, broidMessagePrivateWithMedia);
});

ava('Parse a private message with tag', async (t) => {
  const data = parser.parse(<any> broidMessagePrivateNormalizedWithTag);
  t.deepEqual(await data, broidMessagePrivateWithTag);
});

ava('Validate a simple message', async (t) => {
  const data = parser.validate(<any> broidMessage);
  t.deepEqual(await data, broidMessage);
});

ava('Validate a simple message with media', async (t) => {
  const data = parser.validate(<any> broidMessageWithMedia);
  t.deepEqual(await data, broidMessageWithMedia);
});

ava('Validate a simple message with tag', async (t) => {
  const data = parser.validate(<any> broidMessageWithTag);
  t.deepEqual(await data, broidMessageWithTag);
});

ava('Validate a private message', async (t) => {
  const data = parser.validate(<any> broidMessagePrivate);
  t.deepEqual(await data, broidMessagePrivate);
});

ava('Validate a private message with media', async (t) => {
  const data = parser.validate(<any> broidMessagePrivateWithMedia);
  t.deepEqual(await data, broidMessagePrivateWithMedia);
});

ava('Validate a private message with tag', async (t) => {
  const data = parser.validate(<any> broidMessagePrivateWithTag);
  t.deepEqual(await data, broidMessagePrivateWithTag);
});
