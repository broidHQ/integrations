import test from "ava";
import Parser from "../core/parser";

import * as broidInteractiveMessage from "./fixtures/broid/interactiveMessage.json";
import * as broidMessage from "./fixtures/broid/message.json";
import * as broidMessagePrivate from "./fixtures/broid/messagePrivate.json";
import * as broidMessageWithMedia from "./fixtures/broid/messageWithMedia.json";
import * as slackInteractiveMessage from "./fixtures/slack/interactiveMessage.json";
import * as slackMessage from "./fixtures/slack/message.json";
import * as slackMessagePrivate from "./fixtures/slack/messagePrivate.json";
import * as slackMessageWithMedia from "./fixtures/slack/messageWithMedia.json";

let parser: Parser;
test.before(() => {
  parser = new Parser("test_service", "info");
});

test("Parse null", async(t) => {
  const data = parser.parse(null);
  t.is(await data, null);
});

test("Parse a simple message", async(t) => {
  const data = parser.parse(slackMessage as any);
  t.deepEqual(await data, broidMessage);
});

test("Parse a message with media", async(t) => {
  const data = parser.parse(slackMessageWithMedia as any);
  t.deepEqual(await data, broidMessageWithMedia);
});

test("Parse a private message", async(t) => {
  const data = parser.parse(slackMessagePrivate as any);
  t.deepEqual(await data, broidMessagePrivate);
});

test("Parse a interactive callback message", async(t) => {
  const data = parser.parse(slackInteractiveMessage as any);
  t.deepEqual(await data, broidInteractiveMessage);
});

test("Validate a simple message", async(t) => {
  const data = parser.validate(broidMessage);
  t.deepEqual(await data, broidMessage);
});

test("Validate a message with media", async(t) => {
  const data = parser.validate(broidMessageWithMedia as any);
  t.deepEqual(await data, broidMessageWithMedia);
});

test("Validate a private message", async(t) => {
  const data = parser.validate(broidMessagePrivate as any);
  t.deepEqual(await data, broidMessagePrivate);
});

test("Validate a interactive callback message", async(t) => {
  const data = parser.validate(broidInteractiveMessage as any);
  t.deepEqual(await data, broidInteractiveMessage);
});
