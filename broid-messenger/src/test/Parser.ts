import ava from 'ava';
import { Parser } from '../core/Parser';

import * as messengerMessage from './fixtures/messenger/message.json';
import * as messengerMessageImage from './fixtures/messenger/messageImage.json';
import * as messengerMessageInteractiveCallback from './fixtures/messenger/messageInteractiveCallback.json';
import * as messengerMessageLink from './fixtures/messenger/messageLink.json';
import * as messengerMessageLocation from './fixtures/messenger/messageLocation.json';

import * as broidMessageNorm from './fixtures/broid/normalized/message.json';
import * as broidMessageNormImage from './fixtures/broid/normalized/messageImage.json';
import * as broidMessageNormInteraCallback from './fixtures/broid/normalized/messageInteractiveCallback.json';
import * as broidMessageNormLink from './fixtures/broid/normalized/messageLink.json';
import * as broidMessageNormLocation from './fixtures/broid/normalized/messageLocation.json';

import * as broidMessage from './fixtures/broid/parsed/message.json';
import * as broidMessageImage from './fixtures/broid/parsed/messageImage.json';
import * as broidMessageInteraCallback from './fixtures/broid/parsed/messageInteractiveCallback.json';
import * as broidMessageLink from './fixtures/broid/parsed/messageLink.json';
import * as broidMessageLocation from './fixtures/broid/parsed/messageLocation.json';

const author = {
  first_name: 'Issam',
  id: '1326232313',
  last_name: 'Killix',
  name: 'Issam Hakimi Killix',
};

let parser: Parser;
ava.before(() => {
  parser = new Parser('messenger', 'test_service', 'info');
});

ava('Parse a null', async (t) => {
  const data = parser.parse(null);
  t.deepEqual(await data, null);
});

ava('Normalize a simple message', async (t) => {
  const data = parser.normalize(messengerMessage as any);
  t.deepEqual(await data, broidMessageNorm);
});

ava('Normalize a message with image', async (t) => {
  const data = parser.normalize(messengerMessageImage as any);
  t.deepEqual(await data, broidMessageNormImage);
});

ava('Normalize a message with link', async (t) => {
  const data = parser.normalize(messengerMessageLink as any);
  t.deepEqual(await data, broidMessageNormLink);
});

ava('Normalize a interactive message callback', async (t) => {
  const data = parser.normalize(messengerMessageInteractiveCallback as any);
  t.deepEqual(await data, broidMessageNormInteraCallback);
});

ava('Normalize a location message', async (t) => {
  const data = parser.normalize(messengerMessageLocation as any);
  t.deepEqual(await data, broidMessageNormLocation);
});

ava('Parse a simple message', async (t) => {
  const r: any = Object.assign({}, broidMessageNorm[0]);
  r.authorInformation = author;
  const data = parser.parse(r);
  t.deepEqual(await data, broidMessage);
});

ava('Parse a message with image', async (t) => {
  const r: any = Object.assign({}, broidMessageNormImage[0]);
  r.authorInformation = author;
  const data = parser.parse(r);
  t.deepEqual(await data, broidMessageImage);
});

ava('Parse a message with link', async (t) => {
  const r: any = Object.assign({}, broidMessageNormLink[0]);
  r.authorInformation = author;
  const data = parser.parse(r);
  t.deepEqual(await data, broidMessageLink);
});

ava('Parse a interactive message callback', async (t) => {
  const r: any = Object.assign({}, broidMessageNormInteraCallback[0]);
  r.authorInformation = author;
  const data = parser.parse(r);
  t.deepEqual(await data, broidMessageInteraCallback);
});

ava('Parse a location message', async (t) => {
  const r: any = Object.assign({}, broidMessageNormLocation[0]);
  r.authorInformation = author;
  const data = parser.parse(r);
  t.deepEqual(await data, broidMessageLocation);
});

ava('Validate a simple message', async (t) => {
  const data = parser.validate(broidMessage);
  t.deepEqual(await data, broidMessage);
});

ava('Validate a message with image', async (t) => {
  const data = parser.validate(broidMessageImage);
  t.deepEqual(await data, broidMessageImage);
});

ava('Validate a message with link', async (t) => {
  const data = parser.validate(broidMessageLink);
  t.deepEqual(await data, broidMessageLink);
});

ava('Validate a interactive message callback', async (t) => {
  const data = parser.validate(broidMessageInteraCallback);
  t.deepEqual(await data, broidMessageInteraCallback);
});

ava('Validate a location message', async (t) => {
  const data = parser.validate(broidMessageLocation);
  t.deepEqual(await data, broidMessageLocation);
});
