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
const messengerMessage = require("./fixtures/messenger/message.json");
const messengerMessageImage = require("./fixtures/messenger/messageImage.json");
const messengerMessageInteractiveCallback = require("./fixtures/messenger/messageInteractiveCallback.json");
const messengerMessageLink = require("./fixtures/messenger/messageLink.json");
const messengerMessageLocation = require("./fixtures/messenger/messageLocation.json");
const broidMessageNormalized = require("./fixtures/broid/normalized/message.json");
const broidMessageNormalizedImage = require("./fixtures/broid/normalized/messageImage.json");
const broidMessageNormalizedInteractiveCallback = require("./fixtures/broid/normalized/messageInteractiveCallback.json");
const broidMessageNormalizedLink = require("./fixtures/broid/normalized/messageLink.json");
const broidMessageNormalizedLocation = require("./fixtures/broid/normalized/messageLocation.json");
const broidMessage = require("./fixtures/broid/parsed/message.json");
const broidMessageImage = require("./fixtures/broid/parsed/messageImage.json");
const broidMessageInteractiveCallback = require("./fixtures/broid/parsed/messageInteractiveCallback.json");
const broidMessageLink = require("./fixtures/broid/parsed/messageLink.json");
const broidMessageLocation = require("./fixtures/broid/parsed/messageLocation.json");
const author = {
    first_name: 'Issam',
    id: '1326232313',
    last_name: 'Killix',
    name: 'Issam Hakimi Killix',
};
let parser;
ava_1.default.before(() => {
    parser = new Parser_1.Parser('test_service', 'info');
});
ava_1.default('Parse a null', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.parse(null);
    t.deepEqual(yield data, null);
}));
ava_1.default('Normalize a simple message', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.normalize(messengerMessage);
    t.deepEqual(yield data, broidMessageNormalized);
}));
ava_1.default('Normalize a message with image', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.normalize(messengerMessageImage);
    t.deepEqual(yield data, broidMessageNormalizedImage);
}));
ava_1.default('Normalize a message with link', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.normalize(messengerMessageLink);
    t.deepEqual(yield data, broidMessageNormalizedLink);
}));
ava_1.default('Normalize a interactive message callback', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.normalize(messengerMessageInteractiveCallback);
    t.deepEqual(yield data, broidMessageNormalizedInteractiveCallback);
}));
ava_1.default('Normalize a location message', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.normalize(messengerMessageLocation);
    t.deepEqual(yield data, broidMessageNormalizedLocation);
}));
ava_1.default('Parse a simple message', (t) => __awaiter(this, void 0, void 0, function* () {
    const r = Object.assign({}, broidMessageNormalized[0]);
    r.authorInformation = author;
    const data = parser.parse(r);
    t.deepEqual(yield data, broidMessage);
}));
ava_1.default('Parse a message with image', (t) => __awaiter(this, void 0, void 0, function* () {
    const r = Object.assign({}, broidMessageNormalizedImage[0]);
    r.authorInformation = author;
    const data = parser.parse(r);
    t.deepEqual(yield data, broidMessageImage);
}));
ava_1.default('Parse a message with link', (t) => __awaiter(this, void 0, void 0, function* () {
    const r = Object.assign({}, broidMessageNormalizedLink[0]);
    r.authorInformation = author;
    const data = parser.parse(r);
    t.deepEqual(yield data, broidMessageLink);
}));
ava_1.default('Parse a interactive message callback', (t) => __awaiter(this, void 0, void 0, function* () {
    const r = Object.assign({}, broidMessageNormalizedInteractiveCallback[0]);
    r.authorInformation = author;
    const data = parser.parse(r);
    t.deepEqual(yield data, broidMessageInteractiveCallback);
}));
ava_1.default('Parse a location message', (t) => __awaiter(this, void 0, void 0, function* () {
    const r = Object.assign({}, broidMessageNormalizedLocation[0]);
    r.authorInformation = author;
    const data = parser.parse(r);
    t.deepEqual(yield data, broidMessageLocation);
}));
ava_1.default('Validate a simple message', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.validate(broidMessage);
    t.deepEqual(yield data, broidMessage);
}));
ava_1.default('Validate a message with image', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.validate(broidMessageImage);
    t.deepEqual(yield data, broidMessageImage);
}));
ava_1.default('Validate a message with link', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.validate(broidMessageLink);
    t.deepEqual(yield data, broidMessageLink);
}));
ava_1.default('Validate a interactive message callback', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.validate(broidMessageInteractiveCallback);
    t.deepEqual(yield data, broidMessageInteractiveCallback);
}));
ava_1.default('Validate a location message', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.validate(broidMessageLocation);
    t.deepEqual(yield data, broidMessageLocation);
}));
