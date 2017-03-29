import ava from 'ava';

import { Parser } from '../core/Parser';
import * as broidMessage from './fixtures/broid/message.json';
import * as nexmoMessage from './fixtures/nexmo/message.json';

let parser: Parser;
ava.before(() => {
  parser = new Parser('nexmo', 'testuser', 'info');
});

ava('Parse a group message', async (t) => {
  const data = await parser.parse(nexmoMessage);
  t.deepEqual(data, broidMessage);
});

ava('Validate a group message', async (t) => {
  const data = parser.validate(broidMessage);
  t.deepEqual(await data, broidMessage);
});
