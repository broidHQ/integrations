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
const bluebird = require("bluebird");
const glob = require("glob");
const path = require("path");
const Parser_1 = require("../core/Parser");
const RESPONSE_FIXTURES = {};
glob.sync(path.join(__dirname, './fixtures/wechat/*.json')).forEach((file) => {
    RESPONSE_FIXTURES[path.basename(file).replace('.json', '')] = require(file);
});
const RESULT_FIXTURES = {};
glob.sync(path.join(__dirname, './fixtures/broid/*.json')).forEach((file) => {
    RESULT_FIXTURES[path.basename(file).replace('.json', '')] = require(file);
});
const wechatClient = {
    getLatestTokenAsync: () => bluebird.resolve({ accessToken: 'test' }),
    getUserAsync: () => bluebird.resolve({ nickname: 'My Name' }),
};
let parser;
ava_1.default.before(() => {
<<<<<<< HEAD
    parser = new Parser_1.Parser(wechatClient, 'test_wechat_service', 'info');
=======
    parser = new parser_1.default("wechat", wechatClient, "test_wechat_service", "info");
>>>>>>> exposed-express-router
});
ava_1.default('Parse note message', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.parse(RESPONSE_FIXTURES.note);
    t.deepEqual(yield data, RESULT_FIXTURES.note);
}));
ava_1.default('Parse audio message', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.parse(RESPONSE_FIXTURES.audio);
    t.deepEqual(yield data, RESULT_FIXTURES.audio);
}));
ava_1.default('Parse image message', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.parse(RESPONSE_FIXTURES.image);
    t.deepEqual(yield data, RESULT_FIXTURES.image);
}));
ava_1.default('Parse video message', (t) => __awaiter(this, void 0, void 0, function* () {
    const data = parser.parse(RESPONSE_FIXTURES.video);
    t.deepEqual(yield data, RESULT_FIXTURES.video);
}));
