import * as Promise from 'bluebird';
import * as mmmagic from 'mmmagic';
import * as R from 'ramda';
import * as request from 'request';
import * as validUrl from 'valid-url';

import { Logger } from './Logger';

Promise.promisifyAll(request);

const cleanNulls = R.when(
  R.either(R.is(Array), R.is(Object)),
  R.pipe(
    R.reject(R.isNil),
    R.map((a) => cleanNulls(a)),
  ),
);

// Capitalize the first character of the string
// Return a string
function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const defaults = R.flip(R.merge);
const concat = R.compose(R.join(' '), R.reject(R.isNil));

// Check if a string is an url format
// Return a boolean
function isUrl(url) {
  return validUrl.isWebUri(url);
}

// Return information about one file
// File can be Buffer, ReadStream, file path, file name or url.
// Return an object
function fileInfo(file) {
  const magic = new mmmagic.Magic(false, mmmagic.MAGIC_MIME_TYPE);
  Promise.promisifyAll(magic);

  const logger = new Logger('fileInfo', 'debug');

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

export {
  capitalizeFirstLetter,
  cleanNulls,
  concat,
  defaults,
  fileInfo,
  isUrl,
  Logger,
}
