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

export function parseQuickReplies(quickReplies: any[]): any[] {
  return R.reject(R.isNil)(R.map(
    (button) => {
      if (button.mediaType === 'application/vnd.geo+json') {
        // facebook type: location
        return {
          content_type: 'location',
        };
      }
      return null;
    },
    quickReplies));
}

export function createButtons(buttons: any[]): any[] {
  return R.reject(R.isNil)(R.map(
    (button: any) => {
      // facebook type: postback, element_share
      if (!button.mediaType) {
        return {
          payload: button.url,
          title: button.name,
          type: 'postback',
        };
      } else if (button.mediaType === 'text/html') {
        // facebook type: web_url, account_link
        return {
          title: button.name,
          type: 'web_url',
          url: button.url,
        };
      } else if (button.mediaType === 'audio/telephone-event') {
        // facebook type: phone_number
        return {
          payload: button.url,
          title: button.name,
          type: 'phone_number',
        };
      }

      return null;
    },
    buttons));
}

export function createAttachment(name: string,
                                 content: string,
                                 buttons?: any[],
                                 imageURL?: any): object {
  return {
    payload: {
      elements: [{
        buttons: buttons && !R.isEmpty(buttons) ? buttons : null,
        image_url: imageURL || '',
        item_url: '',
        subtitle: content !== name ? content : '',
        title: name || '',
      }],
      template_type: 'generic',
    },
    type: 'template',
  };
}
