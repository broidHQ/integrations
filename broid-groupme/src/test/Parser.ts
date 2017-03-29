import ava from 'ava';
import * as sinon from 'sinon';

import { Parser } from '../core/Parser';

import * as broidMessageImage from './fixtures/broid/image.json';
import * as broidMessageLocation from './fixtures/broid/location.json';
import * as broidMessage from './fixtures/broid/message.json';

import * as groupmeMessageImage from './fixtures/groupme/image.json';
import * as groupmeMessageLocation from './fixtures/groupme/location.json';
import * as groupmeMessage from './fixtures/groupme/message.json';

let parser: Parser;
ava.before(() => {
  sinon.stub(Date, 'now', () => {
    return 1483589416000;
  });
  parser = new Parser('groupme', 'testuser', 'info');
});

ava('Parse a simple message', async (t) => {
  const data = await parser.parse(groupmeMessage);
  t.deepEqual(data, broidMessage);
});

ava('Parse a location message', async (t) => {
  const data = await parser.parse(groupmeMessageLocation);
  t.deepEqual(data, broidMessageLocation);
});

ava('Parse a  image message', async (t) => {
  const data = await parser.parse(groupmeMessageImage);
  t.deepEqual(data, broidMessageImage);
});

ava('Validate a simple message', async (t) => {
 const data = parser.validate(broidMessage);
 t.deepEqual(await data, broidMessage);
});

ava('Validate a location message', async (t) => {
 const data = parser.validate(broidMessageLocation);
 t.deepEqual(await data, broidMessageLocation);
});

ava('Validate a image message', async (t) => {
 const data = parser.validate(broidMessageImage);
 t.deepEqual(await data, broidMessageImage);
});
