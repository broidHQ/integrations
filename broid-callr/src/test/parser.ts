import test from "ava";
import Parser from "../core/parser";

import * as callrMessage from "./fixtures/callr/message.json";
import * as callrMessageImage from "./fixtures/callr/messageImage.json";
import * as callrMessageVideo from "./fixtures/callr/messageVideo.json";

import * as broidMessageNormalized from "./fixtures/broid/normalized/message.json";
import * as broidMessageNormalizedImage from "./fixtures/broid/normalized/messageImage.json";
import * as broidMessageNormalizedVideo from "./fixtures/broid/normalized/messageVideo.json";

import * as broidMessage from "./fixtures/broid/parsed/message.json";
import * as broidMessageImage from "./fixtures/broid/parsed/messageImage.json";
import * as broidMessageVideo from "./fixtures/broid/parsed/messageVideo.json";

let parser: Parser;
test.before(() => {
  parser = new Parser("callr", "test_service", "info");
});

test("Parse a null", async(t) => {
  const data = parser.parse(null);
  t.deepEqual(await data, null);
});

test("Normalize a null", async(t) => {
  const data = parser.normalize({} as any);
  t.deepEqual(await data, null);
});

test("Normalize a simple message", async(t) => {
  const data = parser.normalize(callrMessage as any);
  t.deepEqual(await data, broidMessageNormalized);
});

test("Normalize a message with image", async(t) => {
  const data = parser.normalize(callrMessageImage as any);
  t.deepEqual(await data, broidMessageNormalizedImage);
});

test("Normalize a message with video", async(t) => {
  const data = parser.normalize(callrMessageVideo as any);
  t.deepEqual(await data, broidMessageNormalizedVideo);
});

test("Parse a simple message", async(t) => {
  const data = parser.parse(broidMessageNormalized);
  t.deepEqual(await data, broidMessage);
});

test("Parse a message with image", async(t) => {
  const data = parser.parse(broidMessageNormalizedImage);
  t.deepEqual(await data, broidMessageImage);
});

test("Parse a message with video", async(t) => {
  const data = parser.parse(broidMessageNormalizedVideo);
  t.deepEqual(await data, broidMessageVideo);
});

test("Validate a simple message", async(t) => {
  const data = parser.validate(broidMessage);
  t.deepEqual(await data, broidMessage);
});

test("Validate a message with image", async(t) => {
  const data = parser.validate(broidMessageImage);
  t.deepEqual(await data, broidMessageImage);
});

test("Validate a message with video", async(t) => {
  const data = parser.validate(broidMessageVideo);
  t.deepEqual(await data, broidMessageVideo);
});
