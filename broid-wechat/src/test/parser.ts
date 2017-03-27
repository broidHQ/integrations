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
import * as bluebird from 'bluebird';
import * as glob from 'glob';
import * as path from 'path';

import { Parser } from '../core/Parser';

const RESPONSE_FIXTURES: any = {};
glob.sync(path.join(__dirname, './fixtures/wechat/*.json')).forEach((file: string) => {
  RESPONSE_FIXTURES[path.basename(file).replace('.json', '')] = require(file); // tslint:disable-line:no-require-imports
});

const RESULT_FIXTURES: any = {};
glob.sync(path.join(__dirname, './fixtures/broid/*.json')).forEach((file: string) => {
  RESULT_FIXTURES[path.basename(file).replace('.json', '')] = require(file); // tslint:disable-line:no-require-imports
});

const wechatClient = {
  getLatestTokenAsync: () => bluebird.resolve({accessToken: 'test'}),
  getUserAsync: () => bluebird.resolve({nickname: 'My Name'}),
};

let parser: Parser;
ava.before(() => {
  parser = new Parser("wechat", wechatClient, "test_wechat_service", "info");
});

ava('Parse note message', async (t) => {
  const data = parser.parse(RESPONSE_FIXTURES.note);
  t.deepEqual(await data, RESULT_FIXTURES.note);
});

ava('Parse audio message', async (t) => {
  const data = parser.parse(RESPONSE_FIXTURES.audio);
  t.deepEqual(await data, RESULT_FIXTURES.audio);
});

ava('Parse image message', async (t) => {
  const data = parser.parse(RESPONSE_FIXTURES.image);
  t.deepEqual(await data, RESULT_FIXTURES.image);
});

ava('Parse video message', async (t) => {
  const data = parser.parse(RESPONSE_FIXTURES.video);
  t.deepEqual(await data, RESULT_FIXTURES.video);
});
