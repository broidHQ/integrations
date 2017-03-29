import ava from 'ava';
import * as glob from 'glob';
import * as path from 'path';

import { Parser } from '../core/Parser';

const RESPONSE_FIXTURES: any = {};
glob.sync(path.join(__dirname, './fixtures/ms-teams/*.json')).forEach((file: string) => {
  // tslint:disable-next-line:no-require-imports non-literal-require
  RESPONSE_FIXTURES[path.basename(file).replace('.json', '')] = require(file);
});

const RESULT_FIXTURES: any = {};
glob.sync(path.join(__dirname, './fixtures/broid/*.json')).forEach((file: string) => {
  // tslint:disable-next-line:no-require-imports non-literal-require
  RESULT_FIXTURES[path.basename(file).replace('.json', '')] = require(file);
});

let parser: Parser;
ava.before(() => {
  parser = new Parser('ms-teams', 'test_service', 'info');
});

ava('Parse a simple message', async (t) => {
  const data = parser.parse(RESPONSE_FIXTURES.message);
  t.deepEqual(await data, RESULT_FIXTURES.message);
});

ava('Parse a message with media', async (t) => {
  const data = parser.parse(RESPONSE_FIXTURES.messageWithImage);
  t.deepEqual(await data, RESULT_FIXTURES.messageWithImage);
});

ava('Parse a message with video', async (t) => {
  const data = parser.parse(RESPONSE_FIXTURES.messageWithVideo);
  t.deepEqual(await data, RESULT_FIXTURES.messageWithVideo);
});

ava('Validate a simple message', async (t) => {
  const data = parser.validate(RESULT_FIXTURES.message);
  t.deepEqual(await data, RESULT_FIXTURES.message);
});

ava('Validate a message with image', async (t) => {
  const data = parser.validate(RESULT_FIXTURES.messageWithImage);
  t.deepEqual(await data, RESULT_FIXTURES.messageWithImage);
});

ava('Validate a message with video', async (t) => {
  const data = parser.validate(RESULT_FIXTURES.messageWithVideo);
  t.deepEqual(await data, RESULT_FIXTURES.messageWithVideo);
});
