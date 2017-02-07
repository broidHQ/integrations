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
const kikMessage = require("./fixtures/kik/message.json");
const kikMessageImage = require("./fixtures/kik/messageImage.json");
const kikMessageInteractiveCallback = require("./fixtures/kik/messageInteractiveCallback.json");
const kikMessageVideo = require("./fixtures/kik/messageVideo.json");
const broidMessageNormalized = require("./fixtures/broid/normalized/message.json");
const broidMessageNormalizedImage = require("./fixtures/broid/normalized/messageImage.json");
const broidMessageNormalizedInteractiveCallback = require("./fixtures/broid/normalized/messageInteractiveCallback.json");
const broidMessageNormalizedVideo = require("./fixtures/broid/normalized/messageVideo.json");
const broidMessage = require("./fixtures/broid/parsed/message.json");
const broidMessageImage = require("./fixtures/broid/parsed/messageImage.json");
const broidMessageInteractiveCallback = require("./fixtures/broid/parsed/messageInteractiveCallback.json");
const broidMessageVideo = require("./fixtures/broid/parsed/messageVideo.json");
const userInformation = {
    displayName: "Issam H.",
    firstName: "Issam",
    id: "killix",
    lastName: "H.",
    profilePicLastModified: null,
    profilePicUrl: null,
    username: "killix",
};
let parser;
ava_1.default.before(() => {
    parser = new parser_1.default("test_service", "info");
});
ava_1.default("Parse a null", (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.parse(null);
    t.deepEqual(yield data, null);
}));
ava_1.default("Normalize a simple message", (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.normalize(kikMessage, userInformation);
    t.deepEqual(yield data, broidMessageNormalized);
}));
ava_1.default("Normalize a message with image", (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.normalize(kikMessageImage, userInformation);
    t.deepEqual(yield data, broidMessageNormalizedImage);
}));
ava_1.default("Normalize a message with video", (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.normalize(kikMessageVideo, userInformation);
    t.deepEqual(yield data, broidMessageNormalizedVideo);
}));
ava_1.default("Normalize a interactive message callback", (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.normalize(kikMessageInteractiveCallback, userInformation);
    t.deepEqual(yield data, broidMessageNormalizedInteractiveCallback);
}));
ava_1.default("Parse a simple message", (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.parse(broidMessageNormalized);
    t.deepEqual(yield data, broidMessage);
}));
ava_1.default("Parse a message with image", (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.parse(broidMessageNormalizedImage);
    t.deepEqual(yield data, broidMessageImage);
}));
ava_1.default("Parse a message with video", (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.parse(broidMessageNormalizedVideo);
    t.deepEqual(yield data, broidMessageVideo);
}));
ava_1.default("Parse a interactive message callback", (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.parse(broidMessageNormalizedInteractiveCallback);
    t.deepEqual(yield data, broidMessageInteractiveCallback);
}));
ava_1.default("Validate a simple message", (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.validate(broidMessage);
    t.deepEqual(yield data, broidMessage);
}));
ava_1.default("Validate a message with image", (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.validate(broidMessageImage);
    t.deepEqual(yield data, broidMessageImage);
}));
ava_1.default("Validate a private message with video", (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.validate(broidMessageVideo);
    t.deepEqual(yield data, broidMessageVideo);
}));
ava_1.default("Validate a interactive message callback", (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.validate(broidMessageInteractiveCallback);
    t.deepEqual(yield data, broidMessageInteractiveCallback);
}));
