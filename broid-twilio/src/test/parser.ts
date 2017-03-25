import test from "ava";
import Parser from "../core/parser";

import * as broidMessage from "./fixtures/broid/message.json";
import * as broidMessageNormalized from "./fixtures/broid/messageNormalized.json";
import * as broidMessageNormalizedWithMedia from "./fixtures/broid/messageNormalizedWithMedia.json";
import * as broidMessageNormalizedWithMedias from "./fixtures/broid/messageNormalizedWithMedias.json";
import * as broidMessageWithMedia from "./fixtures/broid/messageWithMedia.json";
import * as broidMessageWithMedias from "./fixtures/broid/messageWithMedias.json";
import * as twilioMessage from "./fixtures/twilio/message.json";
import * as twilioMessageWithMedia from "./fixtures/twilio/messageWithMedia.json";
import * as twilioMessageWithMedias from "./fixtures/twilio/messageWithMedias.json";


let parser: Parser;
test.before(() => {
  parser = new Parser("twilio", "test_service", "info");
});

test("Parse null", async(t) => {
  const data = parser.parse(null);
  t.is(await data, null);
});

test("Normalize null", async(t) => {
  const d: any = { request: { body: {} } };
  const data = parser.normalize(d);
  t.is(await data, null);
});

test("Normalize a simple message", async(t) => {
  const data = parser.normalize(twilioMessage as any);
  t.deepEqual(await data, broidMessageNormalized);
});

test("Normalize a message with media", async(t) => {
  const data = parser.normalize(twilioMessageWithMedia as any);
  t.deepEqual(await data, broidMessageNormalizedWithMedia);
});

test("Normalize a message with multiple media", async(t) => {
  const data = parser.normalize(twilioMessageWithMedias as any);
  t.deepEqual(await data, broidMessageNormalizedWithMedias);
});

test("Parse a simple message", async(t) => {
  const data = parser.parse(broidMessageNormalized as any);
  t.deepEqual(await data, broidMessage);
});

test("Parse a message with media", async(t) => {
  const data = parser.parse(broidMessageNormalizedWithMedia as any);
  t.deepEqual(await data, broidMessageWithMedia);
});

test("Parse a message with multiple media", async(t) => {
  const data = parser.parse(broidMessageNormalizedWithMedias as any);
  t.deepEqual(await data, broidMessageWithMedias);
});

test("Validate a simple message", async(t) => {
  const data = parser.validate(broidMessage);
  t.deepEqual(await data, broidMessage);
});

test("Validate a message with media", async(t) => {
  const data = parser.validate(broidMessageWithMedia);
  t.deepEqual(await data, broidMessageWithMedia);
});

test("Validate a message with multiple media", async(t) => {
  const data = parser.validate(broidMessageWithMedias);
  t.deepEqual(await data, broidMessageWithMedias);
});
