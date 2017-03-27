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
const sinon = require("sinon");
const Parser_1 = require("../core/Parser");
const broidMessage = require("./fixtures/broid/message.json");
const googleMessage = require("./fixtures/google/message.json");
let parser;
ava_1.default.before(() => {
    sinon.stub(Date, 'now', () => {
        return 1483589416000;
    });
    parser = new Parser_1.Parser('testuser', 'test_broid_service', 'info');
});
ava_1.default('Parse a group message', (t) => __awaiter(this, void 0, void 0, function* () {
    let data = yield parser.parse(googleMessage);
    if (data) {
        data = JSON.parse(JSON.stringify(data));
    }
    t.deepEqual(data, broidMessage);
}));
ava_1.default('Validate a group message', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.validate(broidMessage);
    t.deepEqual(yield data, broidMessage);
}));
