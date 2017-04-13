import { concat } from '@broid/utils';

import * as Promise from 'bluebird';
import * as uuid from 'node-uuid';
import * as R from 'ramda';

import { ISlackAction, IWebHookEvent } from './interfaces';

export function createActions(buttons: any[]): any[] {
  return R.map(
    (button: any) => {
      const r: ISlackAction = {
        name: button.name,
        text: button.content || button.name,
        type: 'button',
        value: button.url,
      };

      if (button.attachment) {
        r.confirm = {
          dismiss_text: R.path(['attachment', 'noLabel'], button),
          ok_text: R.path(['attachment', 'yesLabel'], button),
          text: R.path(['attachment', 'content'], button),
          title: R.path(['attachment', 'name'], button),
        };
      }
      return r;
    },
    buttons);
}

export function createSendMessage(data: any,
                                  message: any,
                                  actions: string,
                                  attachments: any,
                                  responseURL: string): any {
  const dataType = R.path(['object', 'type'], data);
  const name = R.path(['object', 'name'], message);
  const content = R.path(['object', 'content'], message);
  const url = R.path(['object', 'url'], message);
  const messageID = R.path(['object', 'id'], data);
  const targetID = R.path(['to', 'id'], data);
  const callbackID = uuid.v4();

  if (!R.isEmpty(actions)) {
    attachments.push({
      actions,
      callback_id: callbackID,
      fallback: 'You are unable to see interactive message',
      text: '',
    });
  }

  if (dataType === 'Image') {
    attachments.push({ image_url: url, text: '', title: '' });

    return {
      attachments,
      callbackID,
      content: content || name || '',
      messageID,
      responseURL,
      targetID,
    };
  } else if (dataType === 'Video' || dataType === 'Note') {
    let body = content || '';
    if (dataType === 'Video') {
      body = concat([name, '\n', url, '\n', content]);
    }

    return { attachments, callbackID, content: body, messageID, responseURL, targetID };
  }

  return {};
}

export function parseWebHookEvent(event: IWebHookEvent): any {
  const req = event.request;
  const payloadStr: string = R.path(['body', 'payload'], req) as string;
  if (R.isEmpty(payloadStr)) {
    return Promise.resolve(null);
  }

  const payload = JSON.parse(payloadStr);
  let team = payload.team || {};
  if (payload.team_id) {
    team = { id: payload.team_id };
  }

  if (payload.type === 'event_callback'
    && payload.event.type === 'message') {
      return Promise.resolve({
        channel: payload.event.channel.id,
        subtype: 'event_callback',
        team,
        text: payload.event.text,
        ts: payload.event.ts,
        type: 'message',
        user: payload.event.user.id,
      });
  } else if (payload.callback_id) { // interactive message
    return Promise.resolve({
      callback_id: payload.callback_id,
      channel: payload.channel.id,
      response_url: payload.response_url,
      subtype: 'interactive_message',
      team,
      text: payload.actions[0].value,
      ts: payload.action_ts,
      type: 'message',
      user: payload.user.id,
    });
  } else if (payload.command || payload.trigger_word) { // slash command
    return Promise.resolve({
      channel: payload.channel_id,
      subtype: 'slash_command',
      team,
      text: payload.text,
      ts: payload.action_ts,
      type: 'message',
      user: payload.user_id,
    });
  }

  return Promise.resolve({});
}
