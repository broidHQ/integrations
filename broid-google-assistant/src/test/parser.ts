import test from "ava";
import * as sinon from "sinon";

import Parser from "../core/parser";

import * as googleMessage from "./fixtures/google/message.json";
import * as broidMessage from "./fixtures/broid/message.json";

let parser: Parser;
test.before(() => {
  sinon.stub(Date, "now", () => {
    return 1483589416000;
  });

  parser = new Parser("google-assistant", "testuser", "test_broid_service", "info");
});

test("Parse a group message", async (t) => {

  let data = await parser.parse(googleMessage);

  // NOTE: fix the same issue as https://github.com/chaijs/chai/issues/332
  if (data) {
    data = JSON.parse(JSON.stringify(data));
  }

  t.deepEqual(data, broidMessage);
});

test("Validate a group message", async (t) => {
  const data = parser.validate(broidMessage);
  t.deepEqual(await data, broidMessage);
});
