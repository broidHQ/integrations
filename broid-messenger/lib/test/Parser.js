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
const mMessage = require("./fixtures/messenger/message.json");
const mMessageImage = require("./fixtures/messenger/messageImage.json");
const mMessageInteractiveCallback = require("./fixtures/messenger/messageInteractiveCallback.json");
const mMessageInteractiveCallbackTitle = require("./fixtures/messenger/messageInteractiveCallbackTitle.json");
const mMessageLink = require("./fixtures/messenger/messageLink.json");
const mMessageLocation = require("./fixtures/messenger/messageLocation.json");
const broidMessageNorm = require("./fixtures/broid/normalized/message.json");
const broidMessageNormImage = require("./fixtures/broid/normalized/messageImage.json");
const broidMessageNormInteraCallback = require("./fixtures/broid/normalized/messageInteractiveCallback.json");
const broidMessageNormInteraCallbackTitle = require("./fixtures/broid/normalized/messageInteractiveCallbackTitle.json");
const broidMessageNormLink = require("./fixtures/broid/normalized/messageLink.json");
const broidMessageNormLocation = require("./fixtures/broid/normalized/messageLocation.json");
const broidMessage = require("./fixtures/broid/parsed/message.json");
const broidMessageImage = require("./fixtures/broid/parsed/messageImage.json");
const broidMessageInteraCallback = require("./fixtures/broid/parsed/messageInteractiveCallback.json");
const broidMessageInteraCallbackTitle = require("./fixtures/broid/parsed/messageInteractiveCallbackTitle.json");
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
    parser = new Parser_1.Parser('messenger', 'test_service', 'info');
    sinon.stub(utils, 'fileInfo').callsFake((file) => {
        if (file.indexOf('gif') > -1) {
            return Bluebird.resolve({ mimetype: 'image/gif' });
        }
        return Bluebird.resolve({ mimetype: '' });
    });
});
ava_1.default('Parse a null', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.parse(null);
    t.deepEqual(yield data, null);
}));
ava_1.default('Normalize a simple message', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.normalize(mMessage);
    t.deepEqual(yield data, broidMessageNorm);
}));
ava_1.default('Normalize a message with image', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.normalize(mMessageImage);
    t.deepEqual(yield data, broidMessageNormImage);
}));
ava_1.default('Normalize a message with link', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.normalize(mMessageLink);
    t.deepEqual(yield data, broidMessageNormLink);
}));
ava_1.default('Normalize a interactive message callback', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.normalize(mMessageInteractiveCallback);
    t.deepEqual(yield data, broidMessageNormInteraCallback);
}));
ava_1.default('Normalize a interactive message callback with title', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.normalize(mMessageInteractiveCallbackTitle);
    t.deepEqual(yield data, broidMessageNormInteraCallbackTitle);
}));
ava_1.default('Normalize a location message', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.normalize(mMessageLocation);
    t.deepEqual(yield data, broidMessageNormLocation);
}));
ava_1.default('Parse a simple message', (t) => __awaiter(this, void 0, void 0, function* () {
    const r = Object.assign({}, broidMessageNorm[0]);
    r.authorInformation = author;
    const data = parser.parse(r);
    t.deepEqual(yield data, broidMessage);
}));
ava_1.default('Parse a message with image', (t) => __awaiter(this, void 0, void 0, function* () {
    const r = Object.assign({}, broidMessageNormImage[0]);
    r.authorInformation = author;
    const data = parser.parse(r);
    t.deepEqual(yield data, broidMessageImage);
}));
ava_1.default('Parse a message with link', (t) => __awaiter(this, void 0, void 0, function* () {
    const r = Object.assign({}, broidMessageNormLink[0]);
    r.authorInformation = author;
    const data = parser.parse(r);
    t.deepEqual(yield data, broidMessageLink);
}));
ava_1.default('Parse a interactive message callback', (t) => __awaiter(this, void 0, void 0, function* () {
    const r = Object.assign({}, broidMessageNormInteraCallback[0]);
    r.authorInformation = author;
    const data = parser.parse(r);
    t.deepEqual(yield data, broidMessageInteraCallback);
}));
ava_1.default('Parse a interactive message callback with title', (t) => __awaiter(this, void 0, void 0, function* () {
    const r = Object.assign({}, broidMessageNormInteraCallbackTitle[0]);
    r.authorInformation = author;
    const data = parser.parse(r);
    t.deepEqual(yield data, broidMessageInteraCallbackTitle);
}));
ava_1.default('Parse a location message', (t) => __awaiter(this, void 0, void 0, function* () {
    const r = Object.assign({}, broidMessageNormLocation[0]);
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
    const data = parser.validate(broidMessageInteraCallback);
    t.deepEqual(yield data, broidMessageInteraCallback);
}));
ava_1.default('Validate a location message', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.validate(broidMessageLocation);
    t.deepEqual(yield data, broidMessageLocation);
}));
