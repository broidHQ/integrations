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
const broidMessage = require("./fixtures/broid/message.json");
const broidMessageNormalized = require("./fixtures/broid/messageNormalized.json");
const broidMessageNormalizedWithMedia = require("./fixtures/broid/messageNormalizedWithMedia.json");
const broidMessageNormalizedWithTag = require("./fixtures/broid/messageNormalizedWithTag.json");
const broidMessagePrivate = require("./fixtures/broid/messagePrivate.json");
const broidMessagePrivateNormalized = require("./fixtures/broid/messagePrivateNormalized.json");
const broidMessagePrivateNormalizedWithMedia = require("./fixtures/broid/messagePrivateNormalizedWithMedia.json");
const broidMessagePrivateNormalizedWithTag = require("./fixtures/broid/messagePrivateNormalizedWithTag.json");
const broidMessagePrivateWithMedia = require("./fixtures/broid/messagePrivateWithMedia.json");
const broidMessagePrivateWithTag = require("./fixtures/broid/messagePrivateWithTag.json");
const broidMessageWithMedia = require("./fixtures/broid/messageWithMedia.json");
const broidMessageWithTag = require("./fixtures/broid/messageWithTag.json");
const twitterMessage = require("./fixtures/twitter/message.json");
const twitterMessagePrivate = require("./fixtures/twitter/messagePrivate.json");
const twitterMessagePrivateWithMedia = require("./fixtures/twitter/messagePrivateWithMedia.json");
const twitterMessagePrivateWithTag = require("./fixtures/twitter/messagePrivateWithTag.json");
const twitterMessageWithMedia = require("./fixtures/twitter/messageWithMedia.json");
const twitterMessageWithTag = require("./fixtures/twitter/messageWithTag.json");
let parser;
ava_1.default.before(() => {
    parser = new Parser_1.Parser('twitter', 'test_service', 'info');
});
ava_1.default('Parse null', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.parse(null);
    t.is(yield data, null);
}));
ava_1.default('Normalize a simple message', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.normalize(twitterMessage);
    t.deepEqual(yield data, broidMessageNormalized);
}));
ava_1.default('Normalize a simple message with tag', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.normalize(twitterMessageWithTag);
    t.deepEqual(yield data, broidMessageNormalizedWithTag);
}));
ava_1.default('Normalize a private message with tag', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.normalize(twitterMessagePrivateWithTag);
    t.deepEqual(yield data, broidMessagePrivateNormalizedWithTag);
}));
ava_1.default('Normalize a simple message with media', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.normalize(twitterMessageWithMedia);
    t.deepEqual(yield data, broidMessageNormalizedWithMedia);
}));
ava_1.default('Normalize a private message', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.normalize(twitterMessagePrivate);
    t.deepEqual(yield data, broidMessagePrivateNormalized);
}));
ava_1.default('Normalize a private message with media', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.normalize(twitterMessagePrivateWithMedia);
    t.deepEqual(yield data, broidMessagePrivateNormalizedWithMedia);
}));
ava_1.default('Parse a simple message', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.parse(broidMessageNormalized);
    t.deepEqual(yield data, broidMessage);
}));
ava_1.default('Parse a simple message with media', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.parse(broidMessageNormalizedWithMedia);
    t.deepEqual(yield data, broidMessageWithMedia);
}));
ava_1.default('Parse a simple message with tag', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.parse(broidMessageNormalizedWithTag);
    t.deepEqual(yield data, broidMessageWithTag);
}));
ava_1.default('Parse a private message', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.parse(broidMessagePrivateNormalized);
    t.deepEqual(yield data, broidMessagePrivate);
}));
ava_1.default('Parse a private message with media', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.parse(broidMessagePrivateNormalizedWithMedia);
    t.deepEqual(yield data, broidMessagePrivateWithMedia);
}));
ava_1.default('Parse a private message with tag', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.parse(broidMessagePrivateNormalizedWithTag);
    t.deepEqual(yield data, broidMessagePrivateWithTag);
}));
ava_1.default('Validate a simple message', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.validate(broidMessage);
    t.deepEqual(yield data, broidMessage);
}));
ava_1.default('Validate a simple message with media', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.validate(broidMessageWithMedia);
    t.deepEqual(yield data, broidMessageWithMedia);
}));
ava_1.default('Validate a simple message with tag', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.validate(broidMessageWithTag);
    t.deepEqual(yield data, broidMessageWithTag);
}));
ava_1.default('Validate a private message', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.validate(broidMessagePrivate);
    t.deepEqual(yield data, broidMessagePrivate);
}));
ava_1.default('Validate a private message with media', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.validate(broidMessagePrivateWithMedia);
    t.deepEqual(yield data, broidMessagePrivateWithMedia);
}));
ava_1.default('Validate a private message with tag', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.validate(broidMessagePrivateWithTag);
    t.deepEqual(yield data, broidMessagePrivateWithTag);
}));
