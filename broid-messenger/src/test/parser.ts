import test from "ava";
import Parser from "../core/parser";

import * as messengerMessage from "./fixtures/messenger/message.json";
import * as messengerMessageImage from "./fixtures/messenger/messageImage.json";
import * as messengerMessageInteractiveCallback from "./fixtures/messenger/messageInteractiveCallback.json";
import * as messengerMessageLink from "./fixtures/messenger/messageLink.json";
import * as messengerMessageLocation from "./fixtures/messenger/messageLocation.json";

import * as broidMessageNormalized from "./fixtures/broid/normalized/message.json";
import * as broidMessageNormalizedImage from "./fixtures/broid/normalized/messageImage.json";
import * as broidMessageNormalizedInteractiveCallback from "./fixtures/broid/normalized/messageInteractiveCallback.json";
import * as broidMessageNormalizedLink from "./fixtures/broid/normalized/messageLink.json";
import * as broidMessageNormalizedLocation from "./fixtures/broid/normalized/messageLocation.json";

import * as broidMessage from "./fixtures/broid/parsed/message.json";
import * as broidMessageImage from "./fixtures/broid/parsed/messageImage.json";
import * as broidMessageInteractiveCallback from "./fixtures/broid/parsed/messageInteractiveCallback.json";
import * as broidMessageLink from "./fixtures/broid/parsed/messageLink.json";
import * as broidMessageLocation from "./fixtures/broid/parsed/messageLocation.json";

const author = {
  first_name: "Issam",
  id: "1326232313",
  last_name: "Killix",
  name: "Issam Hakimi Killix",
};

let parser: Parser;
test.before(() => {
  parser = new Parser("messenger", "test_service", "info");
});

test("Parse a null", async (t) => {
  const data = parser.parse(null);
  t.deepEqual(await data, null);
});

test("Normalize a simple message", async (t) => {
  const data = parser.normalize(messengerMessage as any);
  t.deepEqual(await data, broidMessageNormalized);
});

test("Normalize a message with image", async (t) => {
  const data = parser.normalize(messengerMessageImage as any);
  t.deepEqual(await data, broidMessageNormalizedImage);
});

test("Normalize a message with link", async (t) => {
  const data = parser.normalize(messengerMessageLink as any);
  t.deepEqual(await data, broidMessageNormalizedLink);
});

test("Normalize a interactive message callback", async (t) => {
  const data = parser.normalize(messengerMessageInteractiveCallback as any);
  t.deepEqual(await data, broidMessageNormalizedInteractiveCallback);
});

test("Normalize a location message", async (t) => {
  const data = parser.normalize(messengerMessageLocation as any);
  t.deepEqual(await data, broidMessageNormalizedLocation);
});

test("Parse a simple message", async (t) => {
  const r: any = Object.assign({}, broidMessageNormalized[0]);
  r.authorInformation = author;
  const data = parser.parse(r);
  t.deepEqual(await data, broidMessage);
});

test("Parse a message with image", async (t) => {
  const r: any = Object.assign({}, broidMessageNormalizedImage[0]);
  r.authorInformation = author;
  const data = parser.parse(r);
  t.deepEqual(await data, broidMessageImage);
});

test("Parse a message with link", async (t) => {
  const r: any = Object.assign({}, broidMessageNormalizedLink[0]);
  r.authorInformation = author;
  const data = parser.parse(r);
  t.deepEqual(await data, broidMessageLink);
});

test("Parse a interactive message callback", async (t) => {
  const r: any = Object.assign({}, broidMessageNormalizedInteractiveCallback[0]);
  r.authorInformation = author;
  const data = parser.parse(r);
  t.deepEqual(await data, broidMessageInteractiveCallback);
});

test("Parse a location message", async (t) => {
  const r: any = Object.assign({}, broidMessageNormalizedLocation[0]);
  r.authorInformation = author;
  const data = parser.parse(r);
  t.deepEqual(await data, broidMessageLocation);
});

test("Validate a simple message", async (t) => {
  const data = parser.validate(broidMessage);
  t.deepEqual(await data, broidMessage);
});

test("Validate a message with image", async (t) => {
  const data = parser.validate(broidMessageImage);
  t.deepEqual(await data, broidMessageImage);
});

test("Validate a message with link", async (t) => {
  const data = parser.validate(broidMessageLink);
  t.deepEqual(await data, broidMessageLink);
});

test("Validate a interactive message callback", async (t) => {
  const data = parser.validate(broidMessageInteractiveCallback);
  t.deepEqual(await data, broidMessageInteractiveCallback);
});

test("Validate a location message", async (t) => {
  const data = parser.validate(broidMessageLocation);
  t.deepEqual(await data, broidMessageLocation);
});
