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
import * as broidMessageEdited from './fixtures/broid/messageEdited.json';
import * as broidMessagePrivate from './fixtures/broid/messagePrivate.json';
import * as broidMessagePrivateEdited from './fixtures/broid/messagePrivateEdited.json';
import * as broidMessagePrivateWithMedia from './fixtures/broid/messagePrivateWithMedia.json';
import * as broidMessageWithMedia from './fixtures/broid/messageWithMedia.json';

import * as discordMessage from './fixtures/discord/message.json';
import * as discordMessageEdited from './fixtures/discord/messageEdited.json';
import * as discordMessagePrivate from './fixtures/discord/messagePrivate.json';
import * as discordMessagePrivateEdited from './fixtures/discord/messagePrivateEdited.json';
import * as discordMessagePrivateWithMedia from './fixtures/discord/messagePrivateWithMedia.json';
import * as discordMessageWithMedia from './fixtures/discord/messageWithMedia.json';

let parser: Parser;
ava.before(() => {
  parser = new Parser('test_service', 'info');
});

ava('Parse a simple message', async (t) => {
  const data = parser.parse(discordMessage);
  t.deepEqual(await data, broidMessage);
});

ava('Parse a message with media', async (t) => {
  const data = parser.parse(discordMessageWithMedia);
  t.deepEqual(await data, broidMessageWithMedia);
});

ava('Parse a edited message', async (t) => {
  const data = parser.parse(discordMessageEdited);
  t.deepEqual(await data, broidMessageEdited);
});

ava('Parse a private message', async (t) => {
  const data = parser.parse(discordMessagePrivate);
  t.deepEqual(await data, broidMessagePrivate);
});

ava('Parse a privatemessage with media', async (t) => {
  const data = parser.parse(discordMessagePrivateWithMedia);
  t.deepEqual(await data, broidMessagePrivateWithMedia);
});

ava('Parse a private edited message', async (t) => {
  const data = parser.parse(discordMessagePrivateEdited);
  t.deepEqual(await data, broidMessagePrivateEdited);
});

ava('Validate a simple message', async (t) => {
  const data = parser.validate(broidMessage);
  t.deepEqual(await data, broidMessage);
});

ava('Validate a message with media', async (t) => {
  const data = parser.validate(broidMessageWithMedia);
  t.deepEqual(await data, broidMessageWithMedia);
});

ava('Validate a edited message', async (t) => {
  const data = parser.validate(broidMessageEdited);
  t.deepEqual(await data, broidMessageEdited);
});

ava('Validate a private message', async (t) => {
  const data = parser.validate(broidMessagePrivate);
  t.deepEqual(await data, broidMessagePrivate);
});

ava('Validate a privatemessage with media', async (t) => {
  const data = parser.validate(broidMessagePrivateWithMedia);
  t.deepEqual(await data, broidMessagePrivateWithMedia);
});

ava('Validate a private edited message', async (t) => {
  const data = parser.validate(broidMessagePrivateEdited);
  t.deepEqual(await data, broidMessagePrivateEdited);
});
