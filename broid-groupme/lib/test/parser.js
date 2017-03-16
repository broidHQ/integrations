"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const ava_1 = require("ava");
const sinon = require("sinon");
const parser_1 = require("../core/parser");
const broidMessageImage = require("./fixtures/broid/image.json");
const broidMessageLocation = require("./fixtures/broid/location.json");
const broidMessage = require("./fixtures/broid/message.json");
const groupmeMessageImage = require("./fixtures/groupme/image.json");
const groupmeMessageLocation = require("./fixtures/groupme/location.json");
const groupmeMessage = require("./fixtures/groupme/message.json");
let parser;
ava_1.default.before(() => {
    sinon.stub(Date, "now", () => {
        return 1483589416000;
    });
    parser = new parser_1.default("groupme", "testuser", "info");
});
ava_1.default("Parse a simple message", (t) => __awaiter(this, void 0, void 0, function* () {
    const data = yield parser.parse(groupmeMessage);
    t.deepEqual(data, broidMessage);
}));
ava_1.default("Parse a location message", (t) => __awaiter(this, void 0, void 0, function* () {
    const data = yield parser.parse(groupmeMessageLocation);
    t.deepEqual(data, broidMessageLocation);
}));
ava_1.default("Parse a  image message", (t) => __awaiter(this, void 0, void 0, function* () {
    const data = yield parser.parse(groupmeMessageImage);
    t.deepEqual(data, broidMessageImage);
}));
ava_1.default("Validate a simple message", (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.validate(broidMessage);
    t.deepEqual(yield data, broidMessage);
}));
ava_1.default("Validate a location message", (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.validate(broidMessageLocation);
    t.deepEqual(yield data, broidMessageLocation);
}));
ava_1.default("Validate a image message", (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.validate(broidMessageImage);
    t.deepEqual(yield data, broidMessageImage);
}));
