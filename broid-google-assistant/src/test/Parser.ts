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

  parser = new Parser('google-assistant', 'testuser', 'test_broid_service', 'info');
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
