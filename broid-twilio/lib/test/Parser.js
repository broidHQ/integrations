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
const broidMessageNorm = require("./fixtures/broid/messageNormalized.json");
const broidMessageNormWithMedia = require("./fixtures/broid/messageNormalizedWithMedia.json");
const broidMessageNormWithMedias = require("./fixtures/broid/messageNormalizedWithMedias.json");
const broidMessageWithMedia = require("./fixtures/broid/messageWithMedia.json");
const broidMessageWithMedias = require("./fixtures/broid/messageWithMedias.json");
const twilioMessage = require("./fixtures/twilio/message.json");
const twilioMessageWithMedia = require("./fixtures/twilio/messageWithMedia.json");
const twilioMessageWithMedias = require("./fixtures/twilio/messageWithMedias.json");
let parser;
ava_1.default.before(() => {
    parser = new Parser_1.Parser('twilio', 'test_service', 'info');
});
ava_1.default('Parse null', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.parse(null);
    t.is(yield data, null);
}));
ava_1.default('Normalize null', (t) => __awaiter(this, void 0, void 0, function* () {
    const d = { request: { body: {} } };
    const data = parser.normalize(d);
    t.is(yield data, null);
}));
ava_1.default('Normalize a simple message', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.normalize(twilioMessage);
    t.deepEqual(yield data, broidMessageNorm);
}));
ava_1.default('Normalize a message with media', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.normalize(twilioMessageWithMedia);
    t.deepEqual(yield data, broidMessageNormWithMedia);
}));
ava_1.default('Normalize a message with multiple media', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.normalize(twilioMessageWithMedias);
    t.deepEqual(yield data, broidMessageNormWithMedias);
}));
ava_1.default('Parse a simple message', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.parse(broidMessageNorm);
    t.deepEqual(yield data, broidMessage);
}));
ava_1.default('Parse a message with media', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.parse(broidMessageNormWithMedia);
    t.deepEqual(yield data, broidMessageWithMedia);
}));
ava_1.default('Parse a message with multiple media', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.parse(broidMessageNormWithMedias);
    t.deepEqual(yield data, broidMessageWithMedias);
}));
ava_1.default('Validate a simple message', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.validate(broidMessage);
    t.deepEqual(yield data, broidMessage);
}));
ava_1.default('Validate a message with media', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.validate(broidMessageWithMedia);
    t.deepEqual(yield data, broidMessageWithMedia);
}));
ava_1.default('Validate a message with multiple media', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.validate(broidMessageWithMedias);
    t.deepEqual(yield data, broidMessageWithMedias);
}));
