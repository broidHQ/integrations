"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const ava_1 = require("ava");
const parser_1 = require("../core/parser");
const broidMessage = require("./fixtures/broid/message.json");
const broidMessageWithImage = require("./fixtures/broid/messageWithImage.json");
const broidMessageWithVideo = require("./fixtures/broid/messageWithVideo.json");
const twilioMessage = require("./fixtures/ms-teams/message.json");
const twilioMessageWithImage = require("./fixtures/ms-teams/messageWithImage.json");
const twilioMessageWithVideo = require("./fixtures/ms-teams/messageWithVideo.json");
let parser;
ava_1.default.before(() => {
    parser = new parser_1.default("test_service", "info");
});
ava_1.default("Parse a simple message", (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.parse(twilioMessage);
    t.deepEqual(yield data, broidMessage);
}));
ava_1.default("Parse a message with media", (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.parse(twilioMessageWithImage);
    t.deepEqual(yield data, broidMessageWithImage);
}));
ava_1.default("Parse a message with video", (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.parse(twilioMessageWithVideo);
    t.deepEqual(yield data, broidMessageWithVideo);
}));
ava_1.default("Validate a simple message", (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.validate(broidMessage);
    t.deepEqual(yield data, broidMessage);
}));
ava_1.default("Validate a message with image", (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.validate(broidMessageWithImage);
    t.deepEqual(yield data, broidMessageWithImage);
}));
ava_1.default("Validate a message with video", (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.validate(broidMessageWithVideo);
    t.deepEqual(yield data, broidMessageWithVideo);
}));
