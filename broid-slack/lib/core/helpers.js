"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@broid/utils");
const Promise = require("bluebird");
const uuid = require("node-uuid");
const R = require("ramda");
function createActions(buttons) {
    return R.map((button) => {
        const r = {
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
    }, buttons);
}
exports.createActions = createActions;
function createSendMessage(data, message, actions, attachments, responseURL) {
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
    }
    else if (dataType === 'Video' || dataType === 'Note') {
        let body = content || '';
        if (dataType === 'Video') {
            body = utils_1.concat([name, '\n', url, '\n', content]);
        }
        return { attachments, callbackID, content: body, messageID, responseURL, targetID };
    }
    return {};
}
exports.createSendMessage = createSendMessage;
function parseWebHookEvent(event) {
    const req = event.request;
    const payloadStr = R.path(['body', 'payload'], req);
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
    }
    else if (payload.callback_id) {
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
    }
    else if (payload.command || payload.trigger_word) {
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
exports.parseWebHookEvent = parseWebHookEvent;
