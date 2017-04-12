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
const broidInteractiveMessage = require("./fixtures/broid/interactiveMessage.json");
const broidMessage = require("./fixtures/broid/message.json");
const broidMessagePrivate = require("./fixtures/broid/messagePrivate.json");
const broidMessageWithMedia = require("./fixtures/broid/messageWithMedia.json");
const slackInteractiveMessage = require("./fixtures/slack/interactiveMessage.json");
const slackMessage = require("./fixtures/slack/message.json");
const slackMessagePrivate = require("./fixtures/slack/messagePrivate.json");
const slackMessageWithMedia = require("./fixtures/slack/messageWithMedia.json");
let parser;
ava_1.default.before(() => {
    parser = new Parser_1.Parser('slack', 'test_service', 'info');
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
ava_1.default('Parse a simple message', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.parse(slackMessage);
    t.deepEqual(yield data, broidMessage);
}));
ava_1.default('Parse a message with media', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.parse(slackMessageWithMedia);
    t.deepEqual(yield data, broidMessageWithMedia);
}));
ava_1.default('Parse a private message', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.parse(slackMessagePrivate);
    t.deepEqual(yield data, broidMessagePrivate);
}));
ava_1.default('Parse a interactive callback message', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.parse(slackInteractiveMessage);
    t.deepEqual(yield data, broidInteractiveMessage);
}));
ava_1.default('Validate a simple message', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.validate(broidMessage);
    t.deepEqual(yield data, broidMessage);
}));
ava_1.default('Validate a message with media', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.validate(broidMessageWithMedia);
    t.deepEqual(yield data, broidMessageWithMedia);
}));
ava_1.default('Validate a private message', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.validate(broidMessagePrivate);
    t.deepEqual(yield data, broidMessagePrivate);
}));
ava_1.default('Validate a interactive callback message', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.validate(broidInteractiveMessage);
    t.deepEqual(yield data, broidInteractiveMessage);
}));
