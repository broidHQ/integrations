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
const telegramMessage = require("./fixtures/telegram/message.json");
const telegramMessageImage = require("./fixtures/telegram/messageImage.json");
const telegramMessageInteractiveCallback = require("./fixtures/telegram/messageInteractiveCallback.json");
const telegramMessagePrivate = require("./fixtures/telegram/messagePrivate.json");
const broidMessageNormalized = require("./fixtures/broid/normalized/message.json");
const broidMessageNormalizedImage = require("./fixtures/broid/normalized/messageImage.json");
const broidMessageNormalizedImageCompleted = require("./fixtures/broid/normalized/messageImageCompleted.json");
const broidMessageNormalizedInteractiveCallback = require("./fixtures/broid/normalized/messageInteractiveCallback.json");
const broidMessageNormalizedPrivate = require("./fixtures/broid/normalized/messagePrivate.json");
const broidMessage = require("./fixtures/broid/parsed/message.json");
const broidMessageImage = require("./fixtures/broid/parsed/messageImage.json");
const broidMessageInteractiveCallback = require("./fixtures/broid/parsed/messageInteractiveCallback.json");
const broidMessagePrivate = require("./fixtures/broid/parsed/messagePrivate.json");
let parser;
ava_1.default.before(() => {
    parser = new Parser_1.Parser('telegram', 'test_service', 'info');
});
ava_1.default('Parse a null', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.parse(null);
    t.deepEqual(yield data, null);
}));
ava_1.default('Parse a null', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.normalize(null);
    t.deepEqual(yield data, null);
}));
ava_1.default('Normalize a simple message', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.normalize(telegramMessage);
    t.deepEqual(yield data, broidMessageNormalized);
}));
ava_1.default('Normalize a message with image', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.normalize(telegramMessageImage);
    t.deepEqual(yield data, broidMessageNormalizedImage);
}));
ava_1.default('Normalize a private message', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.normalize(telegramMessagePrivate);
    t.deepEqual(yield data, broidMessageNormalizedPrivate);
}));
ava_1.default('Normalize a interactive message callback', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.normalize(telegramMessageInteractiveCallback);
    t.deepEqual(yield data, broidMessageNormalizedInteractiveCallback);
}));
ava_1.default('Parse a simple message', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.parse(broidMessageNormalized);
    t.deepEqual(yield data, broidMessage);
}));
ava_1.default('Parse a message with image', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.parse(broidMessageNormalizedImageCompleted);
    t.deepEqual(yield data, broidMessageImage);
}));
ava_1.default('Parse a private message', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.parse(broidMessageNormalizedPrivate);
    t.deepEqual(yield data, broidMessagePrivate);
}));
ava_1.default('Parse a interactive message callback', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.parse(broidMessageNormalizedInteractiveCallback);
    t.deepEqual(yield data, broidMessageInteractiveCallback);
}));
ava_1.default('Validate a simple message', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.validate(broidMessage);
    t.deepEqual(yield data, broidMessage);
}));
ava_1.default('Validate a message with image', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.validate(broidMessageImage);
    t.deepEqual(yield data, broidMessageImage);
}));
ava_1.default('Validate a private message', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.validate(broidMessagePrivate);
    t.deepEqual(yield data, broidMessagePrivate);
}));
ava_1.default('Validate a interactive message callback', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.validate(broidMessageInteractiveCallback);
    t.deepEqual(yield data, broidMessageInteractiveCallback);
}));
