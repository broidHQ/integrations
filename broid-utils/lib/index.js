"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Promise = require("bluebird");
const mmmagic = require("mmmagic");
const R = require("ramda");
const request = require("request");
const validUrl = require("valid-url");
const Logger_1 = require("./Logger");
exports.Logger = Logger_1.Logger;
Promise.promisifyAll(request);
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
function isUrl(url) {
    return validUrl.isWebUri(url);
}
exports.isUrl = isUrl;
function fileInfo(file) {
    const magic = new mmmagic.Magic(false, mmmagic.MAGIC_MIME_TYPE);
    Promise.promisifyAll(magic);
    const logger = new Logger_1.Logger('fileInfo', 'debug');
    return Promise.resolve(isUrl(file))
        .then((is) => {
        if (is) {
            return request.getAsync({ uri: file, encoding: null })
                .then((response) => magic.detectAsync(response.body));
        }
        return magic.detectFileAsync(file);
    })
        .then((mimetype) => ({ mimetype }))
        .catch((error) => {
        logger.error(error);
        return { mimetype: '' };
    });
}
exports.fileInfo = fileInfo;
