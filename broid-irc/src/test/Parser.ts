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
import * as uuid from 'node-uuid';
import * as sinon from 'sinon';

import { Parser } from '../core/Parser';

import * as groupMessage from './fixtures/group-message.json';
import * as privateMessage from './fixtures/private-message.json';

let parser: Parser;
ava.before(() => {
  sinon.stub(uuid, 'v4', () => {
    return '2eb3b34b-3b23-4488-9879-b03e094d250e';
  });

  sinon.stub(Date, 'now', () => {
    return 1483589416000;
  });

  parser = new Parser('testuser', 'test_irc_service', 'info');
});

ava('Parse a group message', async (t) => {
  const data = parser.parse({
    from: 'SallyDude',
    message: 'hello world',
    to: '#supersecretirc',
  });
  t.deepEqual(await data, groupMessage);
});

ava('Parse a private group message', async (t) => {
  const data = parser.parse({
    from: 'SallyDude',
    message: 'hello world',
    to: 'JohnDow',
  });
  t.deepEqual(await data, privateMessage);
});

ava('Validate a group message', async (t) => {
  const data = parser.validate(groupMessage);
  t.deepEqual(await data, groupMessage);
});

ava('Validate a private message', async (t) => {
  const data = parser.validate(privateMessage);
  t.deepEqual(await data, privateMessage);
});
