/**
 * @license
 * Copyright 2017 Broid.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>
 */

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
