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
const broidMessageWithImage = require("./fixtures/broid/messageWithImage.json");
const broidMessageWithVideo = require("./fixtures/broid/messageWithVideo.json");
const skypeMessage = require("./fixtures/skype/message.json");
const skypeMessageWithImage = require("./fixtures/skype/messageWithImage.json");
const skypeMessageWithVideo = require("./fixtures/skype/messageWithVideo.json");
let parser;
ava_1.default.before(() => {
    parser = new Parser_1.Parser('skype', 'test_service', 'info');
});
ava_1.default('Parse a simple message', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.parse(skypeMessage);
    t.deepEqual(yield data, broidMessage);
}));
ava_1.default('Parse a message with media', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.parse(skypeMessageWithImage);
    t.deepEqual(yield data, broidMessageWithImage);
}));
ava_1.default('Parse a message with video', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.parse(skypeMessageWithVideo);
    t.deepEqual(yield data, broidMessageWithVideo);
}));
ava_1.default('Validate a simple message', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.validate(broidMessage);
    t.deepEqual(yield data, broidMessage);
}));
ava_1.default('Validate a message with image', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.validate(broidMessageWithImage);
    t.deepEqual(yield data, broidMessageWithImage);
}));
ava_1.default('Validate a message with video', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.validate(broidMessageWithVideo);
    t.deepEqual(yield data, broidMessageWithVideo);
}));
