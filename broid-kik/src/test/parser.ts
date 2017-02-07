import test from "ava";
import Parser from "../core/parser";

import * as kikMessage from "./fixtures/kik/message.json";
import * as kikMessageImage from "./fixtures/kik/messageImage.json";
import * as kikMessageInteractiveCallback from "./fixtures/kik/messageInteractiveCallback.json";
import * as kikMessageVideo from "./fixtures/kik/messageVideo.json";

import * as broidMessageNormalized from "./fixtures/broid/normalized/message.json";
import * as broidMessageNormalizedImage from "./fixtures/broid/normalized/messageImage.json";
import * as broidMessageNormalizedInteractiveCallback from "./fixtures/broid/normalized/messageInteractiveCallback.json";
import * as broidMessageNormalizedVideo from "./fixtures/broid/normalized/messageVideo.json";

import * as broidMessage from "./fixtures/broid/parsed/message.json";
import * as broidMessageImage from "./fixtures/broid/parsed/messageImage.json";
import * as broidMessageInteractiveCallback from "./fixtures/broid/parsed/messageInteractiveCallback.json";
import * as broidMessageVideo from "./fixtures/broid/parsed/messageVideo.json";

const userInformation: any = {
  displayName: "Issam H.",
  firstName: "Issam",
  id: "killix",
  lastName: "H.",
  profilePicLastModified: null,
  profilePicUrl: null,
  username: "killix",
};

let parser: Parser;
test.before(() => {
  parser = new Parser("test_service", "info");
});

test("Parse a null", async(t) => {
  const data = parser.parse(null);
  t.deepEqual(await data, null);
});

test("Normalize a simple message", async(t) => {
  const data = parser.normalize(kikMessage as any, userInformation);
  t.deepEqual(await data, broidMessageNormalized);
});

test("Normalize a message with image", async(t) => {
  const data = parser.normalize(kikMessageImage as any, userInformation);
  t.deepEqual(await data, broidMessageNormalizedImage);
});

test("Normalize a message with video", async(t) => {
  const data = parser.normalize(kikMessageVideo as any, userInformation);
  t.deepEqual(await data, broidMessageNormalizedVideo);
});

test("Normalize a interactive message callback", async(t) => {
  const data = parser.normalize(kikMessageInteractiveCallback as any, userInformation);
  t.deepEqual(await data, broidMessageNormalizedInteractiveCallback);
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

test("Parse a interactive message callback", async(t) => {
  const data = parser.parse(broidMessageNormalizedInteractiveCallback);
  t.deepEqual(await data, broidMessageInteractiveCallback);
});

test("Validate a simple message", async(t) => {
  const data = parser.validate(broidMessage);
  t.deepEqual(await data, broidMessage);
});

test("Validate a message with image", async(t) => {
  const data = parser.validate(broidMessageImage);
  t.deepEqual(await data, broidMessageImage);
});

test("Validate a private message with video", async(t) => {
  const data = parser.validate(broidMessageVideo);
  t.deepEqual(await data, broidMessageVideo);
});

test("Validate a interactive message callback", async(t) => {
  const data = parser.validate(broidMessageInteractiveCallback);
  t.deepEqual(await data, broidMessageInteractiveCallback);
});
