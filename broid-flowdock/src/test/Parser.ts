import ava from 'ava';
import { Parser } from '../core/Parser';

import * as broidDeleted from './fixtures/broid/messageDeleted.json';
import * as broidUpdated from './fixtures/broid/messageUpdated.json';
import * as broidSimple from './fixtures/broid/simple.json';
import * as broidSimplePrivate from './fixtures/broid/simplePrivate.json';
import * as broidSimplePrivateWithHashtag from './fixtures/broid/simplePrivateWithHashtag.json';
import * as broidWithHashtag from './fixtures/broid/withHashtag.json';

import * as flowdockDeleted from './fixtures/flowdock/messageDeleted.json';
import * as flowdockUpdated from './fixtures/flowdock/messageUpdated.json';
import * as flowdockSimple from './fixtures/flowdock/simple.json';
import * as flowdockSimplePrivate from './fixtures/flowdock/simplePrivate.json';
import * as flowdockSimplePrivateWithHashtag from './fixtures/flowdock/simplePrivateWithHashtag.json';
import * as flowdockWithHashtag from './fixtures/flowdock/withHashtag.json';

let parser: Parser;
ava.before(() => {
  parser = new Parser('flowdock', 'test_service', 'info');
});

ava('Parse null', async (t) => {
  const data = parser.parse({});
  t.is(await data, null);
});

ava('Parse a simple message', async (t) => {
  const data = parser.parse(flowdockSimple);
  t.deepEqual(await data, broidSimple);
});

ava('Parse a message with tag', async (t) => {
  const data = parser.parse(flowdockWithHashtag);
  t.deepEqual(await data, broidWithHashtag);
});

ava('Parse a private message', async (t) => {
  const data = parser.parse(flowdockSimplePrivate);
  t.deepEqual(await data, broidSimplePrivate);
});

ava('Parse a private message with Hashtag', async (t) => {
  const data = parser.parse(flowdockSimplePrivateWithHashtag);
  t.deepEqual(await data, broidSimplePrivateWithHashtag);
});

ava('Parse a upated message', async (t) => {
  const data = parser.parse(flowdockUpdated);
  t.deepEqual(await data, broidUpdated);
});

ava('Parse a deleted message', async (t) => {
  const data = parser.parse(flowdockDeleted);
  t.deepEqual(await data, broidDeleted);
});

ava('Validate a simple message', async (t) => {
  const data = parser.validate(broidSimple);
  t.deepEqual(await data, broidSimple);
});

ava('Validate a message with tag', async (t) => {
  const data = parser.validate(broidWithHashtag);
  t.deepEqual(await data, broidWithHashtag);
});

ava('Validate a private message', async (t) => {
  const data = parser.validate(broidSimplePrivate);
  t.deepEqual(await data, broidSimplePrivate);
});

ava('Validate a private message with Hashtag', async (t) => {
  const data = parser.validate(broidSimplePrivateWithHashtag);
  t.deepEqual(await data, broidSimplePrivateWithHashtag);
});

ava('Validate a upated message', async (t) => {
  const data = parser.validate(broidUpdated);
  t.deepEqual(await data, broidUpdated);
});

ava('Validate a deleted message', async (t) => {
  const data = parser.validate(broidDeleted);
  t.deepEqual(await data, broidDeleted);
});
