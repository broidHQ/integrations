import test from "ava";
import Parser from "../core/parser";

import * as broidMessage from "./fixtures/broid/message.json";
import * as broidMessageWithImage from "./fixtures/broid/messageWithImage.json";
import * as broidMessageWithVideo from "./fixtures/broid/messageWithVideo.json";
import * as twilioMessage from "./fixtures/skype/message.json";
import * as twilioMessageWithImage from "./fixtures/skype/messageWithImage.json";
import * as twilioMessageWithVideo from "./fixtures/skype/messageWithVideo.json";

let parser: Parser;
test.before(() => {
  parser = new Parser("skype", "test_service", "info");
});

test("Parse a simple message", async(t) => {
  const data = parser.parse(twilioMessage as any);
  t.deepEqual(await data, broidMessage);
});

test("Parse a message with media", async(t) => {
  const data = parser.parse(twilioMessageWithImage as any);
  t.deepEqual(await data, broidMessageWithImage);
});

test("Parse a message with video", async(t) => {
  const data = parser.parse(twilioMessageWithVideo as any);
  t.deepEqual(await data, broidMessageWithVideo);
});

test("Validate a simple message", async(t) => {
  const data = parser.validate(broidMessage);
  t.deepEqual(await data, broidMessage);
});

test("Validate a message with image", async(t) => {
  const data = parser.validate(broidMessageWithImage);
  t.deepEqual(await data, broidMessageWithImage);
});

test("Validate a message with video", async(t) => {
  const data = parser.validate(broidMessageWithVideo);
  t.deepEqual(await data, broidMessageWithVideo);
});
