import test from "ava";

import Parser from "../core/parser";

import * as nexmoMessage from "./fixtures/nexmo/message.json";
import * as broidMessage from "./fixtures/broid/message.json";

let parser: Parser;
test.before(() => {

  parser = new Parser("testuser", "info");
});

test("Parse a group message", async (t) => {
  let data = await parser.parse(nexmoMessage);
  t.deepEqual(data, broidMessage);
});

test("Validate a group message", async (t) => {
  const data = parser.validate(broidMessage);
  t.deepEqual(await data, broidMessage);
});
