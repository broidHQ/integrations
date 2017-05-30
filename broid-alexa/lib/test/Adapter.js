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
const Adapter_1 = require("../core/Adapter");
let adapter;
ava_1.default.before(() => {
    adapter = new Adapter_1.Adapter({
        http: {
            host: '0.0.0.0',
            port: 8080,
        },
        logLevel: 'debug',
        serviceID: 'adapter',
    });
});
ava_1.default('Adapter should have all methods', (t) => __awaiter(this, void 0, void 0, function* () {
    const funcs = [
        'channels',
        'connect',
        'disconnect',
        'getRouter',
        'listen',
        'send',
        'serviceId',
        'serviceName',
        'users',
    ];
    funcs.forEach((func) => t.is(typeof adapter[func], 'function'));
}));
