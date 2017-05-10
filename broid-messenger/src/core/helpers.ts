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
        title: !name || R.isEmpty(name) ? imageURL.substring(0, 30) : name,
      }],
      template_type: 'generic',
    },
    type: 'template',
  };
}
