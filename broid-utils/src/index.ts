import * as R from 'ramda';
import {default as Logger} from './Logger';

const cleanNulls = R.when(
  R.either(R.is(Array), R.is(Object)),
  R.pipe(
    R.reject(R.isNil),
    R.map((a) => cleanNulls(a)),
  ),
);

function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const defaults = R.flip(R.merge);
const concat = R.compose(R.join(' '), R.reject(R.isNil));

export {
  capitalizeFirstLetter,
  cleanNulls,
  concat,
  defaults,
  Logger,
}
