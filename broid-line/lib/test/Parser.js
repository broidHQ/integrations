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
const broidMessageNormalizedWithLocation = require("./fixtures/broid/messageNormalizedWithLocation.json");
const broidMessageNormalizedWithMedia = require("./fixtures/broid/messageNormalizedWithMedia.json");
const broidMessagePrivate = require("./fixtures/broid/messagePrivate.json");
const broidMessageNormalizedPrivate = require("./fixtures/broid/messagePrivateNormalized.json");
const broidMessageNormalizedPrivateWithLocation = require("./fixtures/broid/messagePrivateNormalizedWithLocation.json");
const broidMessageNormalizedPrivateWithMedia = require("./fixtures/broid/messagePrivateNormalizedWithMedia.json");
const broidMessagePrivateWithLocation = require("./fixtures/broid/messagePrivateWithLocation.json");
const broidMessagePrivateWithMedia = require("./fixtures/broid/messagePrivateWithMedia.json");
const broidMessageWithLocation = require("./fixtures/broid/messageWithLocation.json");
const broidMessageWithMedia = require("./fixtures/broid/messageWithMedia.json");
const lineMessage = require("./fixtures/line/message.json");
const lineMessagePrivate = require("./fixtures/line/messagePrivate.json");
const lineMessagePrivateLocation = require("./fixtures/line/messagePrivateLocation.json");
const lineMessagePrivateWithMedia = require("./fixtures/line/messagePrivateWithMedia.json");
const lineMessageWithLocation = require("./fixtures/line/messageWithLocation.json");
const lineMessageWithMedia = require("./fixtures/line/messageWithMedia.json");
let parser;
ava_1.default.before(() => {
    parser = new Parser_1.Parser('line', 'test_service', 'info');
});
ava_1.default('Parse null', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.parse(null);
    t.is(yield data, null);
}));
ava_1.default('Normalize a simple message', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.normalize(lineMessage);
    t.deepEqual(yield data, broidMessageNormalized);
}));
ava_1.default('Normalize a location message', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.normalize(lineMessageWithLocation);
    t.deepEqual(yield data, broidMessageNormalizedWithLocation);
}));
ava_1.default('Normalize a message with media', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.normalize(lineMessageWithMedia);
    t.deepEqual(yield data, broidMessageNormalizedWithMedia);
}));
ava_1.default('Normalize a private message', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.normalize(lineMessagePrivate);
    t.deepEqual(yield data, broidMessageNormalizedPrivate);
}));
ava_1.default('Normalize a private location message', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.normalize(lineMessagePrivateLocation);
    t.deepEqual(yield data, broidMessageNormalizedPrivateWithLocation);
}));
ava_1.default('Normalize a private message with media', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.normalize(lineMessagePrivateWithMedia);
    t.deepEqual(yield data, broidMessageNormalizedPrivateWithMedia);
}));
ava_1.default('Parse a simple message', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.parse(broidMessageNormalized);
    t.deepEqual(yield data, broidMessage);
}));
ava_1.default('Parse a location message', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.parse(broidMessageNormalizedWithLocation);
    t.deepEqual(yield data, broidMessageWithLocation);
}));
ava_1.default('Parse a message with media', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.parse(broidMessageNormalizedWithMedia);
    t.deepEqual(yield data, broidMessageWithMedia);
}));
ava_1.default('Parse a private message', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.parse(broidMessageNormalizedPrivate);
    t.deepEqual(yield data, broidMessagePrivate);
}));
ava_1.default('Parse a private location message', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.parse(broidMessageNormalizedPrivateWithLocation);
    t.deepEqual(yield data, broidMessagePrivateWithLocation);
}));
ava_1.default('Parse a private message with media', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.parse(broidMessageNormalizedPrivateWithMedia);
    t.deepEqual(yield data, broidMessagePrivateWithMedia);
}));
ava_1.default('Validate a simple message', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.validate(broidMessage);
    t.deepEqual(yield data, broidMessage);
}));
ava_1.default('Validate a location message', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.validate(broidMessageWithLocation);
    t.deepEqual(yield data, broidMessageWithLocation);
}));
ava_1.default('Validate a message with media', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.validate(broidMessageWithMedia);
    t.deepEqual(yield data, broidMessageWithMedia);
}));
ava_1.default('Validate a private message', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.validate(broidMessagePrivate);
    t.deepEqual(yield data, broidMessagePrivate);
}));
ava_1.default('Validate a private location message', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.validate(broidMessagePrivateWithLocation);
    t.deepEqual(yield data, broidMessagePrivateWithLocation);
}));
ava_1.default('Validate a private message with media', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.validate(broidMessagePrivateWithMedia);
    t.deepEqual(yield data, broidMessagePrivateWithMedia);
}));
