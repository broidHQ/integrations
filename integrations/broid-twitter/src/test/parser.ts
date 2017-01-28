import test from "ava";
import Parser from "../core/parser";

import * as broidMessage from "./fixtures/broid/message.json";
import * as broidMessageNormalized from "./fixtures/broid/messageNormalized.json";
import * as broidMessageNormalizedWithMedia from "./fixtures/broid/messageNormalizedWithMedia.json";
import * as broidMessageNormalizedWithTag from "./fixtures/broid/messageNormalizedWithTag.json";
import * as broidMessagePrivate from "./fixtures/broid/messagePrivate.json";
import * as broidMessagePrivateNormalized from "./fixtures/broid/messagePrivateNormalized.json";
import * as broidMessagePrivateNormalizedWithMedia from "./fixtures/broid/messagePrivateNormalizedWithMedia.json";
import * as broidMessagePrivateNormalizedWithTag from "./fixtures/broid/messagePrivateNormalizedWithTag.json";
import * as broidMessagePrivateWithMedia from "./fixtures/broid/messagePrivateWithMedia.json";
import * as broidMessagePrivateWithTag from "./fixtures/broid/messagePrivateWithTag.json";
import * as broidMessageWithMedia from "./fixtures/broid/messageWithMedia.json";
import * as broidMessageWithTag from "./fixtures/broid/messageWithTag.json";

import * as twitterMessage from "./fixtures/twitter/message.json";
import * as twitterMessagePrivate from "./fixtures/twitter/messagePrivate.json";
import * as twitterMessagePrivateWithMedia from "./fixtures/twitter/messagePrivateWithMedia.json";
import * as twitterMessagePrivateWithTag from "./fixtures/twitter/messagePrivateWithTag.json";
import * as twitterMessageWithMedia from "./fixtures/twitter/messageWithMedia.json";
import * as twitterMessageWithTag from "./fixtures/twitter/messageWithTag.json";

let parser: Parser;
test.before(() => {
  parser = new Parser("test_service", "info");
});

test("Parse null", async(t) => {
  const data = parser.parse(null);
  t.is(await data, null);
});

test("Normalize a simple message", async(t) => {
  const data = parser.normalize(twitterMessage as any);
  t.deepEqual(await data, broidMessageNormalized);
});

test("Normalize a simple message with tag", async(t) => {
  const data = parser.normalize(twitterMessageWithTag as any);
  t.deepEqual(await data, broidMessageNormalizedWithTag);
});

test("Normalize a private message with tag", async(t) => {
  const data = parser.normalize(twitterMessagePrivateWithTag as any);
  t.deepEqual(await data, broidMessagePrivateNormalizedWithTag);
});

test("Normalize a simple message with media", async(t) => {
  const data = parser.normalize(twitterMessageWithMedia as any);
  t.deepEqual(await data, broidMessageNormalizedWithMedia);
});

test("Normalize a private message", async(t) => {
  const data = parser.normalize(twitterMessagePrivate as any);
  t.deepEqual(await data, broidMessagePrivateNormalized);
});

test("Normalize a private message with media", async(t) => {
  const data = parser.normalize(twitterMessagePrivateWithMedia as any);
  t.deepEqual(await data, broidMessagePrivateNormalizedWithMedia);
});

test("Parse a simple message", async(t) => {
  const data = parser.parse(broidMessageNormalized as any);
  t.deepEqual(await data, broidMessage);
});

test("Parse a simple message with media", async(t) => {
  const data = parser.parse(broidMessageNormalizedWithMedia as any);
  t.deepEqual(await data, broidMessageWithMedia);
});

test("Parse a simple message with tag", async(t) => {
  const data = parser.parse(broidMessageNormalizedWithTag as any);
  t.deepEqual(await data, broidMessageWithTag);
});

test("Parse a private message", async(t) => {
  const data = parser.parse(broidMessagePrivateNormalized as any);
  t.deepEqual(await data, broidMessagePrivate);
});

test("Parse a private message with media", async(t) => {
  const data = parser.parse(broidMessagePrivateNormalizedWithMedia as any);
  t.deepEqual(await data, broidMessagePrivateWithMedia);
});

test("Parse a private message with tag", async(t) => {
  const data = parser.parse(broidMessagePrivateNormalizedWithTag as any);
  t.deepEqual(await data, broidMessagePrivateWithTag);
});

test("Validate a simple message", async(t) => {
  const data = parser.validate(broidMessage as any);
  t.deepEqual(await data, broidMessage);
});

test("Validate a simple message with media", async(t) => {
  const data = parser.validate(broidMessageWithMedia as any);
  t.deepEqual(await data, broidMessageWithMedia);
});

test("Validate a simple message with tag", async(t) => {
  const data = parser.validate(broidMessageWithTag as any);
  t.deepEqual(await data, broidMessageWithTag);
});

test("Validate a private message", async(t) => {
  const data = parser.validate(broidMessagePrivate as any);
  t.deepEqual(await data, broidMessagePrivate);
});

test("Validate a private message with media", async(t) => {
  const data = parser.validate(broidMessagePrivateWithMedia as any);
  t.deepEqual(await data, broidMessagePrivateWithMedia);
});

test("Validate a private message with tag", async(t) => {
  const data = parser.validate(broidMessagePrivateWithTag as any);
  t.deepEqual(await data, broidMessagePrivateWithTag);
});
