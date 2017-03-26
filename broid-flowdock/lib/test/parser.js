"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = require("ava");
const Parser_1 = require("../core/Parser");
const broidDeleted = require("./fixtures/broid/messageDeleted.json");
const broidUpdated = require("./fixtures/broid/messageUpdated.json");
const broidSimple = require("./fixtures/broid/simple.json");
const broidSimplePrivate = require("./fixtures/broid/simplePrivate.json");
const broidSimplePrivateWithHashtag = require("./fixtures/broid/simplePrivateWithHashtag.json");
const broidWithHashtag = require("./fixtures/broid/withHashtag.json");
const flowdockDeleted = require("./fixtures/flowdock/messageDeleted.json");
const flowdockUpdated = require("./fixtures/flowdock/messageUpdated.json");
const flowdockSimple = require("./fixtures/flowdock/simple.json");
const flowdockSimplePrivate = require("./fixtures/flowdock/simplePrivate.json");
const flowdockSimplePrivateWithHashtag = require("./fixtures/flowdock/simplePrivateWithHashtag.json");
const flowdockWithHashtag = require("./fixtures/flowdock/withHashtag.json");
let parser;
ava_1.default.before(() => {
    parser = new Parser_1.Parser('test_service', 'info');
});
ava_1.default('Parse null', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.parse({});
    t.is(yield data, null);
}));
ava_1.default('Parse a simple message', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.parse(flowdockSimple);
    t.deepEqual(yield data, broidSimple);
}));
ava_1.default('Parse a message with tag', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.parse(flowdockWithHashtag);
    t.deepEqual(yield data, broidWithHashtag);
}));
ava_1.default('Parse a private message', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.parse(flowdockSimplePrivate);
    t.deepEqual(yield data, broidSimplePrivate);
}));
ava_1.default('Parse a private message with Hashtag', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.parse(flowdockSimplePrivateWithHashtag);
    t.deepEqual(yield data, broidSimplePrivateWithHashtag);
}));
ava_1.default('Parse a upated message', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.parse(flowdockUpdated);
    t.deepEqual(yield data, broidUpdated);
}));
ava_1.default('Parse a deleted message', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.parse(flowdockDeleted);
    t.deepEqual(yield data, broidDeleted);
}));
ava_1.default('Validate a simple message', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.validate(broidSimple);
    t.deepEqual(yield data, broidSimple);
}));
ava_1.default('Validate a message with tag', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.validate(broidWithHashtag);
    t.deepEqual(yield data, broidWithHashtag);
}));
ava_1.default('Validate a private message', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.validate(broidSimplePrivate);
    t.deepEqual(yield data, broidSimplePrivate);
}));
ava_1.default('Validate a private message with Hashtag', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.validate(broidSimplePrivateWithHashtag);
    t.deepEqual(yield data, broidSimplePrivateWithHashtag);
}));
ava_1.default('Validate a upated message', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.validate(broidUpdated);
    t.deepEqual(yield data, broidUpdated);
}));
ava_1.default('Validate a deleted message', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.validate(broidDeleted);
    t.deepEqual(yield data, broidDeleted);
}));
