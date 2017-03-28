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
import * as request from 'request-promise';

const baseURL = 'https://api.groupme.com/v3';

export function getMessages(token: string, groupId: string): Promise<any> {
  return request({
    json: 'true',
    qs: {
      token,
      limit: 100,
    },
    uri: `${baseURL}/groups/${groupId}/messages`,
  }).then((res) => res.response.messages
    .filter(((msg) => !msg.system)));
}

export function getMembers(token: string, groupId: string): Promise<any> {
  return request({
    json: 'true',
    qs: {
      token,
    },
    uri: `${baseURL}/groups/${groupId}`,
  }).then((res) => res.response.members);
}

export function getGroups(token: string): Promise<any> {
  return request({
    json: 'true',
    qs: {
      token,
    },
    uri: `${baseURL}/groups`,
  }).then((res) => res.response);
}

export function postMessage(token: string, payload: any): Promise<any> {
  const post = (data) => request({
    json: data,
    method: 'POST',
    qs: { token },
    resolveWithFullResponse: true,
    uri: `${baseURL}/bots/post`,
  })
  .then((res) => {
    if (res.statusCode !== 202) {
      throw new Error(`Message not sent (${res.statusCode}).`);
    }
    return true;
  });

  if (payload.image) {
    return request.get(payload.image.url)
      .pipe(request.post(
        'https://image.groupme.com/pictures',
        { json: true, qs: { access_token: token } }))
      .then((res) => {
        const url = R.path(['payload', 'url'], res);
        if (!url) { throw new Error('Image URL should exist.'); }
        return url;
      })
      .then((url) => {
        payload.picture_url = url;
        return post(payload);
      });
  }

  return post(payload);
}
