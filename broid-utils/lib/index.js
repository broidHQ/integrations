"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const R = require("ramda");
const Logger_1 = require("./Logger");
exports.Logger = Logger_1.default;
const cleanNulls = R.when(R.either(R.is(Array), R.is(Object)), R.pipe(R.reject(R.isNil), R.map((a) => cleanNulls(a))));
exports.cleanNulls = cleanNulls;
function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
exports.capitalizeFirstLetter = capitalizeFirstLetter;
const defaults = R.flip(R.merge);
exports.defaults = defaults;
const concat = R.compose(R.join(' '), R.reject(R.isNil));
exports.concat = concat;
