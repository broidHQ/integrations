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
function createQuickReplies(buttons) {
    return R.reject(R.isNil)(R.map((button) => {
        if (button.mediaType === 'application/vnd.geo+json') {
            return {
                content_type: 'location',
            };
        }
        else {
            return {
                content_type: 'text',
                payload: button.url,
                title: button.name,
            };
        }
    }, buttons));
}
exports.createQuickReplies = createQuickReplies;
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
function createElement(data) {
    const content = R.path(['content'], data);
    const name = R.path(['name'], data) || content;
    const attachments = R.path(['attachment'], data) || [];
    const buttons = R.filter((attachment) => attachment.type === 'Button', attachments);
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
exports.createElement = createElement;
function createAttachment(name, content, buttons, imageURL) {
    if (imageURL && (!name || R.isEmpty(name)) && (!buttons || R.isEmpty(buttons))) {
        return {
            payload: {
                url: imageURL,
            },
            type: 'image',
        };
    }
    else {
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
exports.createAttachment = createAttachment;
