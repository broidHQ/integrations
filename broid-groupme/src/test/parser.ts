import test from "ava";
import * as sinon from "sinon";

import Parser from "../core/parser";

import * as broidMessageImage from "./fixtures/broid/image.json";
import * as broidMessageLocation from "./fixtures/broid/location.json";
import * as broidMessage from "./fixtures/broid/message.json";

import * as groupmeMessageImage from "./fixtures/groupme/image.json";
import * as groupmeMessageLocation from "./fixtures/groupme/location.json";
import * as groupmeMessage from "./fixtures/groupme/message.json";

let parser: Parser;
test.before(() => {
  sinon.stub(Date, "now", () => {
    return 1483589416000;
  });
  parser = new Parser("groupme", "testuser", "info");
});

test("Parse a simple message", async (t) => {
  const data = await parser.parse(groupmeMessage);
  t.deepEqual(data, broidMessage);
});

test("Parse a location message", async (t) => {
  const data = await parser.parse(groupmeMessageLocation);
  t.deepEqual(data, broidMessageLocation);
});

test("Parse a  image message", async (t) => {
  const data = await parser.parse(groupmeMessageImage);
  t.deepEqual(data, broidMessageImage);
});

test("Validate a simple message", async(t) => {
 const data = parser.validate(broidMessage);
 t.deepEqual(await data, broidMessage);
});

test("Validate a location message", async(t) => {
 const data = parser.validate(broidMessageLocation);
 t.deepEqual(await data, broidMessageLocation);
});

test("Validate a image message", async(t) => {
 const data = parser.validate(broidMessageImage);
 t.deepEqual(await data, broidMessageImage);
});
