"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const R = require("ramda");
function parseQuickReplies(quickReplies) {
    return R.reject(R.isNil)(R.map((button) => {
        if (button.mediaType === 'application/vnd.geo+json') {
            return {
                content_type: 'location',
            };
        }
        return null;
    }, quickReplies));
}
exports.parseQuickReplies = parseQuickReplies;
function createButtons(buttons) {
    return R.reject(R.isNil)(R.map((button) => {
        if (!button.mediaType) {
            return {
                payload: button.url,
                title: button.name,
                type: 'postback',
            };
        }
        else if (button.mediaType === 'text/html') {
            return {
                title: button.name,
                type: 'web_url',
                url: button.url,
            };
        }
        else if (button.mediaType === 'audio/telephone-event') {
            return {
                payload: button.url,
                title: button.name,
                type: 'phone_number',
            };
        }
        return null;
    }, buttons));
}
exports.createButtons = createButtons;
function createAttachment(name, content, buttons, imageURL) {
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
exports.createAttachment = createAttachment;
