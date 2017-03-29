import ava from 'ava';

import { Parser } from '../core/Parser';

import * as gitterMessage from './fixtures/gitter/message.json';
import * as gitterMessagePrivate from './fixtures/gitter/messagePrivate.json';

import * as broidMessage from './fixtures/broid/message.json';
import * as broidMessagePrivate from './fixtures/broid/messagePrivate.json';

let parser: Parser;
ava.before(() => {
  parser = new Parser('gitter', 'testuser', 'info');
});

ava('Parse a group message', async (t) => {
  const data = await parser.parse(gitterMessage);
  t.deepEqual(data, broidMessage);
});

ava('Parse a private message', async (t) => {
  const data = await parser.parse(gitterMessagePrivate);
  t.deepEqual(data, broidMessagePrivate);
});

ava('Validate a group message', async (t) => {
  const data = parser.validate(broidMessage);
  t.deepEqual(await data, broidMessage);
});

ava('Validate a private message', async (t) => {
  const data = parser.validate(broidMessagePrivate);
  t.deepEqual(await data, broidMessagePrivate);
});
