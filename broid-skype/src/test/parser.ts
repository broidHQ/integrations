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
import * as broidMessageWithImage from './fixtures/broid/messageWithImage.json';
import * as broidMessageWithVideo from './fixtures/broid/messageWithVideo.json';
import * as skypeMessage from './fixtures/skype/message.json';
import * as skypeMessageWithImage from './fixtures/skype/messageWithImage.json';
import * as skypeMessageWithVideo from './fixtures/skype/messageWithVideo.json';

let parser: Parser;
ava.before(() => {
  parser = new Parser('test_service', 'info');
});

ava('Parse a simple message', async (t) => {
  const data = parser.parse(skypeMessage);
  t.deepEqual(await data, broidMessage);
});

ava('Parse a message with media', async (t) => {
  const data = parser.parse(<any> skypeMessageWithImage);
  t.deepEqual(await data, broidMessageWithImage);
});

ava('Parse a message with video', async (t) => {
  const data = parser.parse(<any> skypeMessageWithVideo);
  t.deepEqual(await data, broidMessageWithVideo);
});

ava('Validate a simple message', async (t) => {
  const data = parser.validate(broidMessage);
  t.deepEqual(await data, broidMessage);
});

ava('Validate a message with image', async (t) => {
  const data = parser.validate(broidMessageWithImage);
  t.deepEqual(await data, broidMessageWithImage);
});

ava('Validate a message with video', async (t) => {
  const data = parser.validate(broidMessageWithVideo);
  t.deepEqual(await data, broidMessageWithVideo);
});
