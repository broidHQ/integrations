import test from "ava";
import Parser from "../core/parser";

import * as broidMessage from "./fixtures/broid/message.json";
import * as broidMessageEdited from "./fixtures/broid/messageEdited.json";
import * as broidMessagePrivate from "./fixtures/broid/messagePrivate.json";
import * as broidMessagePrivateEdited from "./fixtures/broid/messagePrivateEdited.json";
import * as broidMessagePrivateWithMedia from "./fixtures/broid/messagePrivateWithMedia.json";
import * as broidMessageWithMedia from "./fixtures/broid/messageWithMedia.json";

import * as discordMessage from "./fixtures/discord/message.json";
import * as discordMessageEdited from "./fixtures/discord/messageEdited.json";
import * as discordMessagePrivate from "./fixtures/discord/messagePrivate.json";
import * as discordMessagePrivateEdited from "./fixtures/discord/messagePrivateEdited.json";
import * as discordMessagePrivateWithMedia from "./fixtures/discord/messagePrivateWithMedia.json";
import * as discordMessageWithMedia from "./fixtures/discord/messageWithMedia.json";

let parser: Parser;
test.before(() => {
  parser = new Parser("test_service", "info");
});

test("Parse a simple message", async(t) => {
  const data = parser.parse(discordMessage);
  t.deepEqual(await data, broidMessage);
});

test("Parse a message with media", async(t) => {
  const data = parser.parse(discordMessageWithMedia);
  t.deepEqual(await data, broidMessageWithMedia);
});

test("Parse a edited message", async(t) => {
  const data = parser.parse(discordMessageEdited);
  t.deepEqual(await data, broidMessageEdited);
});

test("Parse a private message", async(t) => {
  const data = parser.parse(discordMessagePrivate);
  t.deepEqual(await data, broidMessagePrivate);
});

test("Parse a privatemessage with media", async(t) => {
  const data = parser.parse(discordMessagePrivateWithMedia);
  t.deepEqual(await data, broidMessagePrivateWithMedia);
});

test("Parse a private edited message", async(t) => {
  const data = parser.parse(discordMessagePrivateEdited);
  t.deepEqual(await data, broidMessagePrivateEdited);
});

test("Validate a simple message", async(t) => {
  const data = parser.validate(broidMessage);
  t.deepEqual(await data, broidMessage);
});

test("Validate a message with media", async(t) => {
  const data = parser.validate(broidMessageWithMedia);
  t.deepEqual(await data, broidMessageWithMedia);
});

test("Validate a edited message", async(t) => {
  const data = parser.validate(broidMessageEdited);
  t.deepEqual(await data, broidMessageEdited);
});

test("Validate a private message", async(t) => {
  const data = parser.validate(broidMessagePrivate);
  t.deepEqual(await data, broidMessagePrivate);
});

test("Validate a privatemessage with media", async(t) => {
  const data = parser.validate(broidMessagePrivateWithMedia);
  t.deepEqual(await data, broidMessagePrivateWithMedia);
});

test("Validate a private edited message", async(t) => {
  const data = parser.validate(broidMessagePrivateEdited);
  t.deepEqual(await data, broidMessagePrivateEdited);
});
