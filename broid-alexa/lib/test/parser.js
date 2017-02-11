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
const alexaMessage = require("./fixtures/alexa/message.json");
const alexaMessageSlots = require("./fixtures/alexa/messageSlots.json");
const broidMessage = require("./fixtures/broid/message.json");
const broidMessageSlots = require("./fixtures/broid/messageSlots.json");
let parser;
ava_1.default.before(() => {
    sinon.stub(Date, "now", () => 1483589416000);
    parser = new parser_1.default("testuser", "info");
});
ava_1.default("Parse a simple message", (t) => __awaiter(this, void 0, void 0, function* () {
    const data = yield parser.parse(alexaMessage);
    t.deepEqual(data, broidMessage);
}));
ava_1.default("Parse a message with slots", (t) => __awaiter(this, void 0, void 0, function* () {
    const data = yield parser.parse(alexaMessageSlots);
    t.deepEqual(data, broidMessageSlots);
}));
ava_1.default("Validate a simple message", (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.validate(broidMessage);
    t.deepEqual(yield data, broidMessage);
}));
ava_1.default("Validate a message with slots", (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.validate(broidMessageSlots);
    t.deepEqual(yield data, broidMessageSlots);
}));
