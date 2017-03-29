import ava from 'ava';
import { Parser } from '../core/Parser';

import * as broidMessage from './fixtures/broid/message.json';
import * as broidMessageNorm from './fixtures/broid/messageNormalized.json';
import * as broidMessageNormWithMedia from './fixtures/broid/messageNormalizedWithMedia.json';
import * as broidMessageNormWithMedias from './fixtures/broid/messageNormalizedWithMedias.json';
import * as broidMessageWithMedia from './fixtures/broid/messageWithMedia.json';
import * as broidMessageWithMedias from './fixtures/broid/messageWithMedias.json';
import * as twilioMessage from './fixtures/twilio/message.json';
import * as twilioMessageWithMedia from './fixtures/twilio/messageWithMedia.json';
import * as twilioMessageWithMedias from './fixtures/twilio/messageWithMedias.json';

let parser: Parser;
ava.before(() => {
  parser = new Parser('twilio', 'test_service', 'info');
});

ava('Parse null', async (t) => {
  const data = parser.parse(null);
  t.is(await data, null);
});

ava('Normalize null', async (t) => {
  const d: any = { request: { body: {} } };
  const data = parser.normalize(d);
  t.is(await data, null);
});

ava('Normalize a simple message', async (t) => {
  const data = parser.normalize(twilioMessage as any);
  t.deepEqual(await data, broidMessageNorm);
});

ava('Normalize a message with media', async (t) => {
  const data = parser.normalize(twilioMessageWithMedia as any);
  t.deepEqual(await data, broidMessageNormWithMedia);
});

ava('Normalize a message with multiple media', async (t) => {
  const data = parser.normalize(twilioMessageWithMedias as any);
  t.deepEqual(await data, broidMessageNormWithMedias);
});

ava('Parse a simple message', async (t) => {
  const data = parser.parse(broidMessageNorm);
  t.deepEqual(await data, broidMessage);
});

ava('Parse a message with media', async (t) => {
  const data = parser.parse(broidMessageNormWithMedia as any);
  t.deepEqual(await data, broidMessageWithMedia);
});

ava('Parse a message with multiple media', async (t) => {
  const data = parser.parse(broidMessageNormWithMedias as any);
  t.deepEqual(await data, broidMessageWithMedias);
});

ava('Validate a simple message', async (t) => {
  const data = parser.validate(broidMessage);
  t.deepEqual(await data, broidMessage);
});

ava('Validate a message with media', async (t) => {
  const data = parser.validate(broidMessageWithMedia);
  t.deepEqual(await data, broidMessageWithMedia);
});

ava('Validate a message with multiple media', async (t) => {
  const data = parser.validate(broidMessageWithMedias);
  t.deepEqual(await data, broidMessageWithMedias);
});
