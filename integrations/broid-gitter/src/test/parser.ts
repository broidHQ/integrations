import test from "ava";

import Parser from "../core/parser";

import * as gitterMessage from "./fixtures/gitter/message.json";
import * as gitterMessagePrivate from "./fixtures/gitter/messagePrivate.json";

import * as broidMessage from "./fixtures/broid/message.json";
import * as broidMessagePrivate from "./fixtures/broid/messagePrivate.json";

let parser: Parser;
test.before(() => {
  parser = new Parser("testuser", "info");
});

test("Parse a group message", async (t) => {
  let data = await parser.parse(gitterMessage);
  t.deepEqual(data, broidMessage);
});

test("Parse a private message", async (t) => {
  let data = await parser.parse(gitterMessagePrivate);
  t.deepEqual(data, broidMessagePrivate);
});

test("Validate a group message", async (t) => {
  const data = parser.validate(broidMessage);
  t.deepEqual(await data, broidMessage);
});

test("Validate a private message", async (t) => {
  const data = parser.validate(broidMessagePrivate);
  t.deepEqual(await data, broidMessagePrivate);
});
