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
import test from 'ava';

import Parser from '../core/parser';

import * as gitterMessage from './fixtures/gitter/message.json';
import * as gitterMessagePrivate from './fixtures/gitter/messagePrivate.json';

import * as broidMessage from './fixtures/broid/message.json';
import * as broidMessagePrivate from './fixtures/broid/messagePrivate.json';

let parser: Parser;
test.before(() => {
  parser = new Parser('testuser', 'info');
});

test('Parse a group message', async (t) => {
  let data = await parser.parse(gitterMessage);
  t.deepEqual(data, broidMessage);
});

test('Parse a private message', async (t) => {
  let data = await parser.parse(gitterMessagePrivate);
  t.deepEqual(data, broidMessagePrivate);
});

test('Validate a group message', async (t) => {
  const data = parser.validate(broidMessage);
  t.deepEqual(await data, broidMessage);
});

test('Validate a private message', async (t) => {
  const data = parser.validate(broidMessagePrivate);
  t.deepEqual(await data, broidMessagePrivate);
});
