import test from "ava";
import * as glob from "glob";
import * as path from "path";

import Parser from "../core/parser";

const RESPONSE_FIXTURES: any = {};
glob.sync(path.join(__dirname, "./fixtures/ms-teams/*.json")).forEach((file: string) => {
  RESPONSE_FIXTURES[path.basename(file).replace(".json", "")] = require(file);
});

const RESULT_FIXTURES: any = {};
glob.sync(path.join(__dirname, "./fixtures/broid/*.json")).forEach((file: string) => {
  RESULT_FIXTURES[path.basename(file).replace(".json", "")] = require(file);
});

let parser: Parser;
test.before(() => {
  parser = new Parser("ms-teams", "test_service", "info");
});

test("Parse a simple message", async (t) => {
  const data = parser.parse(RESPONSE_FIXTURES.message);
  t.deepEqual(await data, RESULT_FIXTURES.message);
});

test("Parse a message with media", async (t) => {
  const data = parser.parse(RESPONSE_FIXTURES.messageWithImage);
  t.deepEqual(await data, RESULT_FIXTURES.messageWithImage);
});

test("Parse a message with video", async (t) => {
  const data = parser.parse(RESPONSE_FIXTURES.messageWithVideo);
  t.deepEqual(await data, RESULT_FIXTURES.messageWithVideo);
});

test("Validate a simple message", async (t) => {
  const data = parser.validate(RESULT_FIXTURES.message);
  t.deepEqual(await data, RESULT_FIXTURES.message);
});

test("Validate a message with image", async (t) => {
  const data = parser.validate(RESULT_FIXTURES.messageWithImage);
  t.deepEqual(await data, RESULT_FIXTURES.messageWithImage);
});

test("Validate a message with video", async (t) => {
  const data = parser.validate(RESULT_FIXTURES.messageWithVideo);
  t.deepEqual(await data, RESULT_FIXTURES.messageWithVideo);
});
