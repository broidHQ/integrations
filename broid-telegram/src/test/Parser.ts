import * as utils from '@broid/utils';

import ava from 'ava';
import * as Bluebird from 'bluebird';
import * as sinon from 'sinon';

import { Parser } from '../core/Parser';

import * as telegramMessage from './fixtures/telegram/message.json';
import * as telegramMessageImage from './fixtures/telegram/messageImage.json';
import * as telegramMessageInteractiveCallback from './fixtures/telegram/messageInteractiveCallback.json';
import * as telegramMessagePrivate from './fixtures/telegram/messagePrivate.json';

import * as broidMessageNorm from './fixtures/broid/normalized/message.json';
import * as broidMessageNormImage from './fixtures/broid/normalized/messageImage.json';
import * as broidMessageNormImageCompleted from './fixtures/broid/normalized/messageImageCompleted.json';
import * as broidMessageNormInteraCallback from './fixtures/broid/normalized/messageInteractiveCallback.json';
import * as broidMessageNormPrivate from './fixtures/broid/normalized/messagePrivate.json';

import * as broidMessage from './fixtures/broid/parsed/message.json';
import * as broidMessageImage from './fixtures/broid/parsed/messageImage.json';
import * as broidMessageInteraCallback from './fixtures/broid/parsed/messageInteractiveCallback.json';
import * as broidMessagePrivate from './fixtures/broid/parsed/messagePrivate.json';

let parser: Parser;
ava.before(() => {
  parser = new Parser('telegram', 'test_service', 'info');
  sinon.stub(utils, 'fileInfo').callsFake((file) => {
    if (file.indexOf('jpg') > -1) {
      return Bluebird.resolve({ mimetype: 'image/jpeg' });
    } else if (file.indexOf('mp4') > -1) {
      return Bluebird.resolve({ mimetype: 'video/mp4' });
    }
    return Bluebird.resolve({ mimetype: '' });
  });
});

ava('Parse a null', async (t) => {
  const data = parser.parse(null);
  t.deepEqual(await data, null);
});

ava('Parse a null', async (t) => {
  const data = parser.normalize(null);
  t.deepEqual(await data, null);
});

ava('Normalize a simple message', async (t) => {
  const data = parser.normalize(telegramMessage as any);
  t.deepEqual(await data, broidMessageNorm);
});

ava('Normalize a message with image', async (t) => {
  const data = parser.normalize(telegramMessageImage as any);
  t.deepEqual(await data, broidMessageNormImage);
});

ava('Normalize a private message', async (t) => {
  const data = parser.normalize(telegramMessagePrivate as any);
  t.deepEqual(await data, broidMessageNormPrivate);
});

ava('Normalize a interactive message callback', async (t) => {
  const data = parser.normalize(telegramMessageInteractiveCallback as any);
  t.deepEqual(await data, broidMessageNormInteraCallback);
});

ava('Parse a simple message', async (t) => {
  const data = parser.parse(broidMessageNorm);
  t.deepEqual(await data, broidMessage);
});

ava('Parse a message with image', async (t) => {
  const data = parser.parse(broidMessageNormImageCompleted);
  t.deepEqual(await data, broidMessageImage);
});

ava('Parse a private message', async (t) => {
  const data = parser.parse(broidMessageNormPrivate);
  t.deepEqual(await data, broidMessagePrivate);
});

ava('Parse a interactive message callback', async (t) => {
  const data = parser.parse(broidMessageNormInteraCallback);
  t.deepEqual(await data, broidMessageInteraCallback);
});

ava('Validate a simple message', async (t) => {
  const data = parser.validate(broidMessage);
  t.deepEqual(await data, broidMessage);
});

ava('Validate a message with image', async (t) => {
  const data = parser.validate(broidMessageImage);
  t.deepEqual(await data, broidMessageImage);
});

ava('Validate a private message', async (t) => {
  const data = parser.validate(broidMessagePrivate);
  t.deepEqual(await data, broidMessagePrivate);
});

ava('Validate a interactive message callback', async (t) => {
  const data = parser.validate(broidMessageInteraCallback);
  t.deepEqual(await data, broidMessageInteraCallback);
});
