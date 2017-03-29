import ava from 'ava';
import { Parser } from '../core/Parser';

import * as broidMessage from './fixtures/broid/message.json';
import * as broidMessageWithImage from './fixtures/broid/messageWithImage.json';
import * as broidMessageWithVideo from './fixtures/broid/messageWithVideo.json';
import * as skypeMessage from './fixtures/skype/message.json';
import * as skypeMessageWithImage from './fixtures/skype/messageWithImage.json';
import * as skypeMessageWithVideo from './fixtures/skype/messageWithVideo.json';

let parser: Parser;
ava.before(() => {
  parser = new Parser('skype', 'test_service', 'info');
});

ava('Parse a simple message', async (t) => {
  const data = parser.parse(skypeMessage);
  t.deepEqual(await data, broidMessage);
});

ava('Parse a message with media', async (t) => {
  const data = parser.parse(skypeMessageWithImage as any);
  t.deepEqual(await data, broidMessageWithImage);
});

ava('Parse a message with video', async (t) => {
  const data = parser.parse(skypeMessageWithVideo as any);
  t.deepEqual(await data, broidMessageWithVideo);
});

ava('Validate a simple message', async (t) => {
  const data = parser.validate(broidMessage);
  t.deepEqual(await data, broidMessage);
});

ava('Validate a message with image', async (t) => {
  const data = parser.validate(broidMessageWithImage);
  t.deepEqual(await data, broidMessageWithImage);
});

ava('Validate a message with video', async (t) => {
  const data = parser.validate(broidMessageWithVideo);
  t.deepEqual(await data, broidMessageWithVideo);
});
