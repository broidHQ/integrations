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
const broidMessageEdited = require("./fixtures/broid/messageEdited.json");
const broidMessagePrivate = require("./fixtures/broid/messagePrivate.json");
const broidMessagePrivateEdited = require("./fixtures/broid/messagePrivateEdited.json");
const broidMessagePrivateWithMedia = require("./fixtures/broid/messagePrivateWithMedia.json");
const broidMessageWithMedia = require("./fixtures/broid/messageWithMedia.json");
const discordMessage = require("./fixtures/discord/message.json");
const discordMessageEdited = require("./fixtures/discord/messageEdited.json");
const discordMessagePrivate = require("./fixtures/discord/messagePrivate.json");
const discordMessagePrivateEdited = require("./fixtures/discord/messagePrivateEdited.json");
const discordMessagePrivateWithMedia = require("./fixtures/discord/messagePrivateWithMedia.json");
const discordMessageWithMedia = require("./fixtures/discord/messageWithMedia.json");
let parser;
ava_1.default.before(() => {
    parser = new Parser_1.Parser('discord', 'test_service', 'info');
});
ava_1.default('Parse a simple message', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.parse(discordMessage);
    t.deepEqual(yield data, broidMessage);
}));
ava_1.default('Parse a message with media', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.parse(discordMessageWithMedia);
    t.deepEqual(yield data, broidMessageWithMedia);
}));
ava_1.default('Parse a edited message', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.parse(discordMessageEdited);
    t.deepEqual(yield data, broidMessageEdited);
}));
ava_1.default('Parse a private message', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.parse(discordMessagePrivate);
    t.deepEqual(yield data, broidMessagePrivate);
}));
ava_1.default('Parse a privatemessage with media', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.parse(discordMessagePrivateWithMedia);
    t.deepEqual(yield data, broidMessagePrivateWithMedia);
}));
ava_1.default('Parse a private edited message', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.parse(discordMessagePrivateEdited);
    t.deepEqual(yield data, broidMessagePrivateEdited);
}));
ava_1.default('Validate a simple message', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.validate(broidMessage);
    t.deepEqual(yield data, broidMessage);
}));
ava_1.default('Validate a message with media', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.validate(broidMessageWithMedia);
    t.deepEqual(yield data, broidMessageWithMedia);
}));
ava_1.default('Validate a edited message', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.validate(broidMessageEdited);
    t.deepEqual(yield data, broidMessageEdited);
}));
ava_1.default('Validate a private message', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.validate(broidMessagePrivate);
    t.deepEqual(yield data, broidMessagePrivate);
}));
ava_1.default('Validate a privatemessage with media', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.validate(broidMessagePrivateWithMedia);
    t.deepEqual(yield data, broidMessagePrivateWithMedia);
}));
ava_1.default('Validate a private edited message', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.validate(broidMessagePrivateEdited);
    t.deepEqual(yield data, broidMessagePrivateEdited);
}));
