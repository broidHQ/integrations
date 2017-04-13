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
const utils = require("@broid/utils");
const ava_1 = require("ava");
const Bluebird = require("bluebird");
const sinon = require("sinon");
const Parser_1 = require("../core/Parser");
const broidMessage = require("./fixtures/broid/message.json");
const broidMessageNorm = require("./fixtures/broid/messageNormalized.json");
const broidMessageNormWithMedia = require("./fixtures/broid/messageNormalizedWithMedia.json");
const broidMessageNormWithTag = require("./fixtures/broid/messageNormalizedWithTag.json");
const broidMessagePv = require("./fixtures/broid/messagePrivate.json");
const broidMessagePvNorm = require("./fixtures/broid/messagePrivateNormalized.json");
const broidMessagePvNormWithMedia = require("./fixtures/broid/messagePrivateNormalizedWithMedia.json");
const broidMessagePvNormWithTag = require("./fixtures/broid/messagePrivateNormalizedWithTag.json");
const broidMessagePvWithMedia = require("./fixtures/broid/messagePrivateWithMedia.json");
const broidMessagePvWithTag = require("./fixtures/broid/messagePrivateWithTag.json");
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
    sinon.stub(utils, 'fileInfo').callsFake((file) => {
        if (file.indexOf('jpg') > -1) {
            return Bluebird.resolve({ mimetype: 'image/jpeg' });
        }
        else if (file.indexOf('mp4') > -1) {
            return Bluebird.resolve({ mimetype: 'video/mp4' });
        }
        return Bluebird.resolve({ mimetype: '' });
    });
});
ava_1.default('Parse null', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.parse(null);
    t.is(yield data, null);
}));
ava_1.default('Normalize a simple message', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.normalize(twitterMessage);
    t.deepEqual(yield data, broidMessageNorm);
}));
ava_1.default('Normalize a simple message with tag', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.normalize(twitterMessageWithTag);
    t.deepEqual(yield data, broidMessageNormWithTag);
}));
ava_1.default('Normalize a private message with tag', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.normalize(twitterMessagePrivateWithTag);
    t.deepEqual(yield data, broidMessagePvNormWithTag);
}));
ava_1.default('Normalize a simple message with media', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.normalize(twitterMessageWithMedia);
    t.deepEqual(yield data, broidMessageNormWithMedia);
}));
ava_1.default('Normalize a private message', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.normalize(twitterMessagePrivate);
    t.deepEqual(yield data, broidMessagePvNorm);
}));
ava_1.default('Normalize a private message with media', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.normalize(twitterMessagePrivateWithMedia);
    t.deepEqual(yield data, broidMessagePvNormWithMedia);
}));
ava_1.default('Parse a simple message', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.parse(broidMessageNorm);
    t.deepEqual(yield data, broidMessage);
}));
ava_1.default('Parse a simple message with media', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.parse(broidMessageNormWithMedia);
    t.deepEqual(yield data, broidMessageWithMedia);
}));
ava_1.default('Parse a simple message with tag', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.parse(broidMessageNormWithTag);
    t.deepEqual(yield data, broidMessageWithTag);
}));
ava_1.default('Parse a private message', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.parse(broidMessagePvNorm);
    t.deepEqual(yield data, broidMessagePv);
}));
ava_1.default('Parse a private message with media', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.parse(broidMessagePvNormWithMedia);
    t.deepEqual(yield data, broidMessagePvWithMedia);
}));
ava_1.default('Parse a private message with tag', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.parse(broidMessagePvNormWithTag);
    t.deepEqual(yield data, broidMessagePvWithTag);
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
    const data = parser.validate(broidMessagePv);
    t.deepEqual(yield data, broidMessagePv);
}));
ava_1.default('Validate a private message with media', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.validate(broidMessagePvWithMedia);
    t.deepEqual(yield data, broidMessagePvWithMedia);
}));
ava_1.default('Validate a private message with tag', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.validate(broidMessagePvWithTag);
    t.deepEqual(yield data, broidMessagePvWithTag);
}));
