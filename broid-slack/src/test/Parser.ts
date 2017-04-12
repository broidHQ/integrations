import * as utils from '@broid/utils';

import ava from 'ava';
import * as Bluebird from 'bluebird';
import * as sinon from 'sinon';

import { Parser } from '../core/Parser';

import * as broidInteractiveMessage from './fixtures/broid/interactiveMessage.json';
import * as broidMessage from './fixtures/broid/message.json';
import * as broidMessagePrivate from './fixtures/broid/messagePrivate.json';
import * as broidMessageWithMedia from './fixtures/broid/messageWithMedia.json';
import * as slackInteractiveMessage from './fixtures/slack/interactiveMessage.json';
import * as slackMessage from './fixtures/slack/message.json';
import * as slackMessagePrivate from './fixtures/slack/messagePrivate.json';
import * as slackMessageWithMedia from './fixtures/slack/messageWithMedia.json';

let parser: Parser;
ava.before(() => {
  parser = new Parser('slack', 'test_service', 'info');
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

ava('Parse a simple message', async (t) => {
  const data = parser.parse(slackMessage as any);
  t.deepEqual(await data, broidMessage);
});

ava('Parse a message with media', async (t) => {
  const data = parser.parse(slackMessageWithMedia as any);
  t.deepEqual(await data, broidMessageWithMedia);
});

ava('Parse a private message', async (t) => {
  const data = parser.parse(slackMessagePrivate as any);
  t.deepEqual(await data, broidMessagePrivate);
});

ava('Parse a interactive callback message', async (t) => {
  const data = parser.parse(slackInteractiveMessage as any);
  t.deepEqual(await data, broidInteractiveMessage);
});

ava('Validate a simple message', async (t) => {
  const data = parser.validate(broidMessage);
  t.deepEqual(await data, broidMessage);
});

ava('Validate a message with media', async (t) => {
  const data = parser.validate(broidMessageWithMedia as any);
  t.deepEqual(await data, broidMessageWithMedia);
});

ava('Validate a private message', async (t) => {
  const data = parser.validate(broidMessagePrivate as any);
  t.deepEqual(await data, broidMessagePrivate);
});

ava('Validate a interactive callback message', async (t) => {
  const data = parser.validate(broidInteractiveMessage as any);
  t.deepEqual(await data, broidInteractiveMessage);
});
