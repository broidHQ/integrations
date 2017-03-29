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
  parser = new Parser('alexa', 'testuser', 'info');
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
