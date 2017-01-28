import test from "ava";
import Parser from "../core/parser";

import * as broidMessage from "./fixtures/broid/message.json";
import * as broidMessageNormalized from "./fixtures/broid/messageNormalized.json";
import * as broidMessageNormalizedWithLocation from "./fixtures/broid/messageNormalizedWithLocation.json";
import * as broidMessageNormalizedWithMedia from "./fixtures/broid/messageNormalizedWithMedia.json";
import * as broidMessagePrivate from "./fixtures/broid/messagePrivate.json";
import * as broidMessageNormalizedPrivate from "./fixtures/broid/messagePrivateNormalized.json";
import * as broidMessageNormalizedPrivateWithLocation from "./fixtures/broid/messagePrivateNormalizedWithLocation.json";
import * as broidMessageNormalizedPrivateWithMedia from "./fixtures/broid/messagePrivateNormalizedWithMedia.json";
import * as broidMessagePrivateWithLocation from "./fixtures/broid/messagePrivateWithLocation.json";
import * as broidMessagePrivateWithMedia from "./fixtures/broid/messagePrivateWithMedia.json";
import * as broidMessageWithLocation from "./fixtures/broid/messageWithLocation.json";
import * as broidMessageWithMedia from "./fixtures/broid/messageWithMedia.json";
import * as lineMessage from "./fixtures/line/message.json";
import * as lineMessagePrivate from "./fixtures/line/messagePrivate.json";
import * as lineMessagePrivateLocation from "./fixtures/line/messagePrivateLocation.json";
import * as lineMessagePrivateWithMedia from "./fixtures/line/messagePrivateWithMedia.json";
import * as lineMessageWithLocation from "./fixtures/line/messageWithLocation.json";
import * as lineMessageWithMedia from "./fixtures/line/messageWithMedia.json";

let parser: Parser;
test.before(() => {
  parser = new Parser("test_service", "info");
});

test("Parse null", async(t) => {
  const data = parser.parse(null);
  t.is(await data, null);
});

test("Normalize a simple message", async(t) => {
  const data = parser.normalize(lineMessage);
  t.deepEqual(await data, broidMessageNormalized);
});

test("Normalize a location message", async(t) => {
  const data = parser.normalize(lineMessageWithLocation);
  t.deepEqual(await data, broidMessageNormalizedWithLocation);
});

test("Normalize a message with media", async(t) => {
  const data = parser.normalize(lineMessageWithMedia);
  t.deepEqual(await data, broidMessageNormalizedWithMedia);
});

test("Normalize a private message", async(t) => {
  const data = parser.normalize(lineMessagePrivate);
  t.deepEqual(await data, broidMessageNormalizedPrivate);
});

test("Normalize a private location message", async(t) => {
  const data = parser.normalize(lineMessagePrivateLocation);
  t.deepEqual(await data, broidMessageNormalizedPrivateWithLocation);
});

test("Normalize a private message with media", async(t) => {
  const data = parser.normalize(lineMessagePrivateWithMedia);
  t.deepEqual(await data, broidMessageNormalizedPrivateWithMedia);
});

test("Parse a simple message", async(t) => {
  const data = parser.parse(broidMessageNormalized);
  t.deepEqual(await data, broidMessage);
});

test("Parse a location message", async(t) => {
  const data = parser.parse(broidMessageNormalizedWithLocation);
  t.deepEqual(await data, broidMessageWithLocation);
});

test("Parse a message with media", async(t) => {
  const data = parser.parse(broidMessageNormalizedWithMedia);
  t.deepEqual(await data, broidMessageWithMedia);
});

test("Parse a private message", async(t) => {
  const data = parser.parse(broidMessageNormalizedPrivate);
  t.deepEqual(await data, broidMessagePrivate);
});

test("Parse a private location message", async(t) => {
  const data = parser.parse(broidMessageNormalizedPrivateWithLocation);
  t.deepEqual(await data, broidMessagePrivateWithLocation);
});

test("Parse a private message with media", async(t) => {
  const data = parser.parse(broidMessageNormalizedPrivateWithMedia);
  t.deepEqual(await data, broidMessagePrivateWithMedia);
});

test("Validate a simple message", async(t) => {
  const data = parser.validate(broidMessage);
  t.deepEqual(await data, broidMessage);
});

test("Validate a location message", async(t) => {
  const data = parser.validate(broidMessageWithLocation);
  t.deepEqual(await data, broidMessageWithLocation);
});

test("Validate a message with media", async(t) => {
  const data = parser.validate(broidMessageWithMedia);
  t.deepEqual(await data, broidMessageWithMedia);
});

test("Validate a private message", async(t) => {
  const data = parser.validate(broidMessagePrivate);
  t.deepEqual(await data, broidMessagePrivate);
});

test("Validate a private location message", async(t) => {
  const data = parser.validate(broidMessagePrivateWithLocation);
  t.deepEqual(await data, broidMessagePrivateWithLocation);
});

test("Validate a private message with media", async(t) => {
  const data = parser.validate(broidMessagePrivateWithMedia);
  t.deepEqual(await data, broidMessagePrivateWithMedia);
});
