import * as utils from '@broid/utils';

import ava from 'ava';
import * as Bluebird from 'bluebird';
import * as sinon from 'sinon';

import { Parser } from '../core/Parser';

import * as broidMessage from './fixtures/broid/message.json';
import * as broidMessageNorm from './fixtures/broid/messageNormalized.json';
import * as broidMessageNormWithMedia from './fixtures/broid/messageNormalizedWithMedia.json';
import * as broidMessageNormWithTag from './fixtures/broid/messageNormalizedWithTag.json';
import * as broidMessagePv from './fixtures/broid/messagePrivate.json';
import * as broidMessagePvNorm from './fixtures/broid/messagePrivateNormalized.json';
import * as broidMessagePvNormWithMedia from './fixtures/broid/messagePrivateNormalizedWithMedia.json';
import * as broidMessagePvNormWithTag from './fixtures/broid/messagePrivateNormalizedWithTag.json';
import * as broidMessagePvWithMedia from './fixtures/broid/messagePrivateWithMedia.json';
import * as broidMessagePvWithTag from './fixtures/broid/messagePrivateWithTag.json';
import * as broidMessageWithMedia from './fixtures/broid/messageWithMedia.json';
import * as broidMessageWithTag from './fixtures/broid/messageWithTag.json';

import * as twitterMessage from './fixtures/twitter/message.json';
import * as twitterMessagePrivate from './fixtures/twitter/messagePrivate.json';
import * as twitterMessagePrivateWithMedia from './fixtures/twitter/messagePrivateWithMedia.json';
import * as twitterMessagePrivateWithTag from './fixtures/twitter/messagePrivateWithTag.json';
import * as twitterMessageWithMedia from './fixtures/twitter/messageWithMedia.json';
import * as twitterMessageWithTag from './fixtures/twitter/messageWithTag.json';

let parser: Parser;
ava.before(() => {
  parser = new Parser('twitter', 'test_service', 'info');
  sinon.stub(utils, 'fileInfo').callsFake((file) => {
    if (file.indexOf('jpg') > -1) {
      return Bluebird.resolve({ mimetype: 'image/jpeg' });
    } else if (file.indexOf('mp4') > -1) {
      return Bluebird.resolve({ mimetype: 'video/mp4' });
    }
    return Bluebird.resolve({ mimetype: '' });
  });
});

ava('Parse null', async (t) => {
  const data = parser.parse(null);
  t.is(await data, null);
});

ava('Normalize a simple message', async (t) => {
  const data = parser.normalize(twitterMessage as any);
  t.deepEqual(await data, broidMessageNorm);
});

ava('Normalize a simple message with tag', async (t) => {
  const data = parser.normalize(twitterMessageWithTag as any);
  t.deepEqual(await data, broidMessageNormWithTag);
});

ava('Normalize a private message with tag', async (t) => {
  const data = parser.normalize(twitterMessagePrivateWithTag as any);
  t.deepEqual(await data, broidMessagePvNormWithTag);
});

ava('Normalize a simple message with media', async (t) => {
  const data = parser.normalize(twitterMessageWithMedia as any);
  t.deepEqual(await data, broidMessageNormWithMedia);
});

ava('Normalize a private message', async (t) => {
  const data = parser.normalize(twitterMessagePrivate as any);
  t.deepEqual(await data, broidMessagePvNorm);
});

ava('Normalize a private message with media', async (t) => {
  const data = parser.normalize(twitterMessagePrivateWithMedia as any);
  t.deepEqual(await data, broidMessagePvNormWithMedia);
});

ava('Parse a simple message', async (t) => {
  const data = parser.parse(broidMessageNorm) as any;
  t.deepEqual(await data, broidMessage);
});

ava('Parse a simple message with media', async (t) => {
  const data = parser.parse(broidMessageNormWithMedia as any);
  t.deepEqual(await data, broidMessageWithMedia);
});

ava('Parse a simple message with tag', async (t) => {
  const data = parser.parse(broidMessageNormWithTag as any);
  t.deepEqual(await data, broidMessageWithTag);
});

ava('Parse a private message', async (t) => {
  const data = parser.parse(broidMessagePvNorm as any);
  t.deepEqual(await data, broidMessagePv);
});

ava('Parse a private message with media', async (t) => {
  const data = parser.parse(broidMessagePvNormWithMedia as any);
  t.deepEqual(await data, broidMessagePvWithMedia);
});

ava('Parse a private message with tag', async (t) => {
  const data = parser.parse(broidMessagePvNormWithTag as any);
  t.deepEqual(await data, broidMessagePvWithTag);
});

ava('Validate a simple message', async (t) => {
  const data = parser.validate(broidMessage as any);
  t.deepEqual(await data, broidMessage);
});

ava('Validate a simple message with media', async (t) => {
  const data = parser.validate(broidMessageWithMedia as any);
  t.deepEqual(await data, broidMessageWithMedia);
});

ava('Validate a simple message with tag', async (t) => {
  const data = parser.validate(broidMessageWithTag as any);
  t.deepEqual(await data, broidMessageWithTag);
});

ava('Validate a private message', async (t) => {
  const data = parser.validate(broidMessagePv as any);
  t.deepEqual(await data, broidMessagePv);
});

ava('Validate a private message with media', async (t) => {
  const data = parser.validate(broidMessagePvWithMedia as any);
  t.deepEqual(await data, broidMessagePvWithMedia);
});

ava('Validate a private message with tag', async (t) => {
  const data = parser.validate(broidMessagePvWithTag as any);
  t.deepEqual(await data, broidMessagePvWithTag);
});
