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
const uuid = require("node-uuid");
const sinon = require("sinon");
const Parser_1 = require("../core/Parser");
const groupMessage = require("./fixtures/group-message.json");
const privateMessage = require("./fixtures/private-message.json");
let parser;
ava_1.default.before(() => {
    sinon.stub(uuid, 'v4', () => {
        return '2eb3b34b-3b23-4488-9879-b03e094d250e';
    });
    sinon.stub(Date, 'now', () => {
        return 1483589416000;
    });
    parser = new Parser_1.Parser('irc', 'testuser', 'test_irc_service', 'info');
});
ava_1.default('Parse a group message', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.parse({
        from: 'SallyDude',
        message: 'hello world',
        to: '#supersecretirc',
    });
    t.deepEqual(yield data, groupMessage);
}));
ava_1.default('Parse a private group message', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.parse({
        from: 'SallyDude',
        message: 'hello world',
        to: 'JohnDow',
    });
    t.deepEqual(yield data, privateMessage);
}));
ava_1.default('Validate a group message', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.validate(groupMessage);
    t.deepEqual(yield data, groupMessage);
}));
ava_1.default('Validate a private message', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.validate(privateMessage);
    t.deepEqual(yield data, privateMessage);
}));
