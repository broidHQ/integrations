import ava from 'ava';
import { Parser } from '../core/Parser';

import * as kikMessage from './fixtures/kik/message.json';
import * as kikMessageImage from './fixtures/kik/messageImage.json';
import * as kikMessageInteractiveCallback from './fixtures/kik/messageInteractiveCallback.json';
import * as kikMessageVideo from './fixtures/kik/messageVideo.json';

import * as broidMessageNorma from './fixtures/broid/normalized/message.json';
import * as broidMessageNormaImage from './fixtures/broid/normalized/messageImage.json';
import * as broidMessageNormaInteraCallback from './fixtures/broid/normalized/messageInteractiveCallback.json';
import * as broidMessageNormaVideo from './fixtures/broid/normalized/messageVideo.json';

import * as broidMessage from './fixtures/broid/parsed/message.json';
import * as broidMessageImage from './fixtures/broid/parsed/messageImage.json';
import * as broidMessageInteractiveCallback from './fixtures/broid/parsed/messageInteractiveCallback.json';
import * as broidMessageVideo from './fixtures/broid/parsed/messageVideo.json';

const userInformation: any = {
  displayName: 'Issam H.',
  firstName: 'Issam',
  id: 'killix',
  lastName: 'H.',
  profilePicLastModified: null,
  profilePicUrl: null,
  username: 'killix',
};

let parser: Parser;
ava.before(() => {
  parser = new Parser('kik', 'test_service', 'info');
});

ava('Parse a null', async (t) => {
  const data = parser.parse(null);
  t.deepEqual(await data, null);
});

ava('Normalize a simple message', async (t) => {
  const data = parser.normalize(kikMessage as any, userInformation);
  t.deepEqual(await data, broidMessageNorma);
});

ava('Normalize a message with image', async (t) => {
  const data = parser.normalize(kikMessageImage as any, userInformation);
  t.deepEqual(await data, broidMessageNormaImage);
});

ava('Normalize a message with video', async (t) => {
  const data = parser.normalize(kikMessageVideo as any, userInformation);
  t.deepEqual(await data, broidMessageNormaVideo);
});

ava('Normalize a interactive message callback', async (t) => {
  const data = parser.normalize(kikMessageInteractiveCallback as any, userInformation);
  t.deepEqual(await data, broidMessageNormaInteraCallback);
});

ava('Parse a simple message', async (t) => {
  const data = parser.parse(broidMessageNorma);
  t.deepEqual(await data, broidMessage);
});

ava('Parse a message with image', async (t) => {
  const data = parser.parse(broidMessageNormaImage);
  t.deepEqual(await data, broidMessageImage);
});

ava('Parse a message with video', async (t) => {
  const data = parser.parse(broidMessageNormaVideo);
  t.deepEqual(await data, broidMessageVideo);
});

ava('Parse a interactive message callback', async (t) => {
  const data = parser.parse(broidMessageNormaInteraCallback);
  t.deepEqual(await data, broidMessageInteractiveCallback);
});

ava('Validate a simple message', async (t) => {
  const data = parser.validate(broidMessage);
  t.deepEqual(await data, broidMessage);
});

ava('Validate a message with image', async (t) => {
  const data = parser.validate(broidMessageImage);
  t.deepEqual(await data, broidMessageImage);
});

ava('Validate a private message with video', async (t) => {
  const data = parser.validate(broidMessageVideo);
  t.deepEqual(await data, broidMessageVideo);
});

ava('Validate a interactive message callback', async (t) => {
  const data = parser.validate(broidMessageInteractiveCallback);
  t.deepEqual(await data, broidMessageInteractiveCallback);
});
