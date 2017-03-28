import test from "ava";

import Parser from "../core/parser";
import * as broidMessage from "./fixtures/broid/message.json";
import * as nexmoMessage from "./fixtures/nexmo/message.json";

let parser: Parser;
test.before(() => {

  parser = new Parser("nexmo", "testuser", "info");
});

test("Parse a group message", async(t) => {
  const data = await parser.parse(nexmoMessage);
  t.deepEqual(data, broidMessage);
});

test("Validate a group message", async(t) => {
  const data = parser.validate(broidMessage);
  t.deepEqual(await data, broidMessage);
});
