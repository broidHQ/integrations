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
import * as sinon from 'sinon';

import { Parser } from '../core/Parser';

import * as alexaMessage from './fixtures/alexa/message.json';
import * as alexaMessageSlots from './fixtures/alexa/messageSlots.json';

import * as broidMessage from './fixtures/broid/message.json';
import * as broidMessageSlots from './fixtures/broid/messageSlots.json';

let parser: Parser;
ava.before(() => {
  sinon.stub(Date, 'now', () => 1483589416000);
  parser = new Parser('testuser', 'info');
});

ava('Parse a simple message', async (t) => {
  const data = await parser.parse(alexaMessage);
  t.deepEqual(data, broidMessage);
});

ava('Parse a message with slots', async (t) => {
  const data = await parser.parse(alexaMessageSlots);
  t.deepEqual(data, broidMessageSlots);
});

ava('Validate a simple message', async (t) => {
  const data = parser.validate(broidMessage);
  t.deepEqual(await data, broidMessage);
});

ava('Validate a message with slots', async (t) => {
  const data = parser.validate(broidMessageSlots);
  t.deepEqual(await data, broidMessageSlots);
});
