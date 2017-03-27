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
import * as glob from 'glob';
import * as path from 'path';

import { Parser } from '../core/Parser';

const RESPONSE_FIXTURES: any = {};
glob.sync(path.join(__dirname, './fixtures/ms-teams/*.json')).forEach((file: string) => {
  RESPONSE_FIXTURES[path.basename(file).replace('.json', '')] = require(file);
});

const RESULT_FIXTURES: any = {};
glob.sync(path.join(__dirname, './fixtures/broid/*.json')).forEach((file: string) => {
  RESULT_FIXTURES[path.basename(file).replace('.json', '')] = require(file);
});

let parser: Parser;
ava.before(() => {
  parser = new Parser('ms-teams', 'test_service', 'info');
});

ava('Parse a simple message', async (t) => {
  const data = parser.parse(RESPONSE_FIXTURES.message);
  t.deepEqual(await data, RESULT_FIXTURES.message);
});

ava('Parse a message with media', async (t) => {
  const data = parser.parse(RESPONSE_FIXTURES.messageWithImage);
  t.deepEqual(await data, RESULT_FIXTURES.messageWithImage);
});

ava('Parse a message with video', async (t) => {
  const data = parser.parse(RESPONSE_FIXTURES.messageWithVideo);
  t.deepEqual(await data, RESULT_FIXTURES.messageWithVideo);
});

ava('Validate a simple message', async (t) => {
  const data = parser.validate(RESULT_FIXTURES.message);
  t.deepEqual(await data, RESULT_FIXTURES.message);
});

ava('Validate a message with image', async (t) => {
  const data = parser.validate(RESULT_FIXTURES.messageWithImage);
  t.deepEqual(await data, RESULT_FIXTURES.messageWithImage);
});

ava('Validate a message with video', async (t) => {
  const data = parser.validate(RESULT_FIXTURES.messageWithVideo);
  t.deepEqual(await data, RESULT_FIXTURES.messageWithVideo);
});
