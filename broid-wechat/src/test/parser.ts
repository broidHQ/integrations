import test from "ava";
import * as bluebird from "bluebird";
import * as glob from "glob";
import * as path from "path";

import Parser from "../core/parser";

const RESPONSE_FIXTURES: any = {};
glob.sync(path.join(__dirname, "./fixtures/wechat/*.json")).forEach((file: string) => {
  RESPONSE_FIXTURES[path.basename(file).replace(".json", "")] = require(file);
});

const RESULT_FIXTURES: any = {};
glob.sync(path.join(__dirname, "./fixtures/broid/*.json")).forEach((file: string) => {
  RESULT_FIXTURES[path.basename(file).replace(".json", "")] = require(file);
});

const wechatClient = {
  getLatestTokenAsync: () => bluebird.resolve({accessToken: "test"}),
  getUserAsync: () => bluebird.resolve({nickname: "My Name"}),
};

let parser: Parser;
test.before(() => {
  parser = new Parser("wechat", wechatClient, "test_wechat_service", "info");
});

test("Parse note message", async (t) => {
  const data = parser.parse(RESPONSE_FIXTURES.note);
  t.deepEqual(await data, RESULT_FIXTURES.note);
});

test("Parse audio message", async (t) => {
  const data = parser.parse(RESPONSE_FIXTURES.audio);
  t.deepEqual(await data, RESULT_FIXTURES.audio);
});

test("Parse image message", async (t) => {
  const data = parser.parse(RESPONSE_FIXTURES.image);
  t.deepEqual(await data, RESULT_FIXTURES.image);
});

test("Parse video message", async (t) => {
  const data = parser.parse(RESPONSE_FIXTURES.video);
  t.deepEqual(await data, RESULT_FIXTURES.video);
});
