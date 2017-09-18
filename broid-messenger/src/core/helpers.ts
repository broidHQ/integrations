import * as crypto from 'crypto';
import * as R from 'ramda';

export function isXHubSignatureValid(request: any, secret: string): boolean {
  const expected = crypto.createHmac('sha1', secret)
      .update(JSON.stringify(request.body), 'utf8')
      .digest('hex');
  const received = request.headers['x-hub-signature'].split('sha1=')[1];
  return crypto.timingSafeEqual(new Buffer(received, 'utf8'), new Buffer(expected, 'utf8'));
}

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

export function createQuickReplies(buttons: any[]): any[] {
  return R.reject(R.isNil)(R.map(
    (button: any) => {
      if (button.mediaType === 'application/vnd.geo+json') {
        return {
          content_type: 'location',
        };
      } else {
        return {
          content_type: 'text',
          payload: button.url,
          title: button.content || button.name,
        };
      }
      // TODO:
      // {
      //   "content_type":"text",
      //   "title":"Red",
      //   "image_url":"http://example.com/img/red.png",
      //   "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_RED"
      // }
    },
    buttons));
}

export function createButtons(buttons: any[]): any[] {
  return R.reject(R.isNil)(R.map(
    (button: any) => {
      // facebook type: postback, element_share
      if (!button.mediaType) {
        return {
          payload: button.url,
          title: button.content || button.name,
          type: 'postback',
        };
      } else if (button.mediaType === 'text/html') {
        // facebook type: web_url, account_link
        return {
          title: button.content || button.name,
          type: 'web_url',
          url: button.url,
        };
      } else if (button.mediaType === 'audio/telephone-event') {
        // facebook type: phone_number
        return {
          payload: button.url,
          title: button.content || button.name,
          type: 'phone_number',
        };
      } else if (button.mediaType === 'broid/share') {
        return {
          "type": "element_share",
        };
      }

      // TODO: "type":"payment", "type": "account_link",
      return null;
    },
    buttons));
}

export function createElement(data: any): any {
  const content: string = R.path(['content'], data) as string;
  const name: string = R.path(['name'], data) as string || content;
  const attachments: any[] = R.path(['attachment'], data) as any[] || [];
  const buttons = R.filter(
    (attachment: any) => attachment.type === 'Button',
    attachments);
  const fButtons = createButtons(buttons);
  const imageURL = R.prop('url', data);

  return {
    buttons: fButtons && !R.isEmpty(fButtons) ? fButtons : null,
    image_url: imageURL || '',
    item_url: '',
    subtitle: content !== name ? content : '',
    title: !name || R.isEmpty(name) ? content.substring(0, 10) : name,
  };
}

export function createAttachment(name: string,
                                 content: string,
                                 buttons?: any[],
                                 imageURL?: any): object {
  if (imageURL && (!name || R.isEmpty(name)) && (!buttons || R.isEmpty(buttons))) { // image
    return {
      payload: {
        url: imageURL,
      },
      type: 'image',
    };
  } else { // card
    return {
      payload: {
        elements: [{
          buttons: buttons && !R.isEmpty(buttons) ? buttons : null,
          image_url: imageURL || '',
          item_url: '',
          subtitle: content !== name ? content : '',
          title: !name || R.isEmpty(name) ? content.substring(0, 10) : name,
        }],
        template_type: 'generic',
      },
      type: 'template',
    };
  }
}
