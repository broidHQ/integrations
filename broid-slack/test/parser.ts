import test from "ava";
import broidSchemas from "@broid/schemas";
import Parser from "../core/parser";

import * as flowdockSimple from "./fixtures/flowdock/simple.json";
import * as broidSimple from "./fixtures/broid/simple.json";
import * as flowdockWithHashtag from "./fixtures/flowdock/withHashtag.json";
import * as broidWithHashtag from "./fixtures/broid/withHashtag.json";
import * as flowdockSimplePrivate from "./fixtures/flowdock/simplePrivate.json";
import * as broidSimplePrivate from "./fixtures/broid/simplePrivate.json";
import * as flowdockSimplePrivateWithHashtag from "./fixtures/flowdock/simplePrivateWithHashtag.json";
import * as broidSimplePrivateWithHashtag from "./fixtures/broid/simplePrivateWithHashtag.json";

import * as flowdockUpdated from "./fixtures/flowdock/messageUpdated.json";
import * as broidUpdated from "./fixtures/broid/messageUpdated.json";
import * as flowdockDeleted from "./fixtures/flowdock/messageDeleted.json";
import * as broidDeleted from "./fixtures/broid/messageDeleted.json";

let parser: Parser;
test.before(() => {
  parser = new Parser("test_service", "info");
});

test("Parse null", async t => {
  const data = parser.parse({});
  t.is(await data, null);
});

test("Parse a simple message", async t => {
  const data = parser.parse(flowdockSimple);
  t.deepEqual(await data, broidSimple);
});

test("Parse a message with tag", async t => {
  const data = parser.parse(flowdockWithHashtag);
  t.deepEqual(await data, broidWithHashtag);
});

test("Parse a private message", async t => {
  const data = parser.parse(flowdockSimplePrivate);
  t.deepEqual(await data, broidSimplePrivate);
});

test("Parse a private message with Hashtag", async t => {
  const data = parser.parse(flowdockSimplePrivateWithHashtag);
  t.deepEqual(await data, broidSimplePrivateWithHashtag);
});

test("Parse a upated message", async t => {
  const data = parser.parse(flowdockUpdated);
  t.deepEqual(await data, broidUpdated);
});

test("Parse a deleted message", async t => {
  const data = parser.parse(flowdockDeleted);
  t.deepEqual(await data, broidDeleted);
});

test("Validate a simple message", async t => {
  const data = broidSchemas(broidSimple, "activity");
  t.true(await data);
});

test("Validate a message with tag", async t => {
  const data = broidSchemas(broidWithHashtag, "activity");
  t.true(await data);
});

test("Validate a private message", async t => {
  const data = broidSchemas(broidSimplePrivate, "activity");
  t.true(await data);
});

test("Validate a private message with Hashtag", async t => {
  const data = broidSchemas(broidSimplePrivateWithHashtag, "activity");
  t.true(await data);
});

test("Validate a upated message", async t => {
  const data = broidSchemas(broidUpdated, "activity");
  t.true(await data);
});

test("Validate a deleted message", async t => {
  const data = broidSchemas(broidDeleted, "activity");
  t.true(await data);
});
