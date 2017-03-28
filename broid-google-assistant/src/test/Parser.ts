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

import * as broidMessage from './fixtures/broid/message.json';
import * as googleMessage from './fixtures/google/message.json';

let parser: Parser;
ava.before(() => {
  sinon.stub(Date, 'now', () => {
    return 1483589416000;
  });

  parser = new Parser('testuser', 'test_broid_service', 'info');
});

ava('Parse a group message', async (t) => {

  let data = await parser.parse(googleMessage);

  // NOTE: fix the same issue as https://github.com/chaijs/chai/issues/332
  if (data) {
    data = JSON.parse(JSON.stringify(data));
  }

  t.deepEqual(data, broidMessage);
});

ava('Validate a group message', async (t) => {
  const data = parser.validate(broidMessage);
  t.deepEqual(await data, broidMessage);
});
