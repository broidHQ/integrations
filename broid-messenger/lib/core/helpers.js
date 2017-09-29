"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = require("crypto");
const R = require("ramda");
function isXHubSignatureValid(request, secret) {
    const expected = crypto.createHmac('sha1', secret)
        .update(JSON.stringify(request.body), 'utf8')
        .digest('hex');
    const received = request.headers['x-hub-signature'].split('sha1=')[1];
    return crypto.timingSafeEqual(new Buffer(received, 'utf8'), new Buffer(expected, 'utf8'));
}
exports.isXHubSignatureValid = isXHubSignatureValid;
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
        else if (button.mediaType === 'text/plain') {
            return {
                content_type: 'text',
                payload: button.url,
                title: button.content || button.name,
            };
        }
        return null;
    }, buttons));
}
exports.createQuickReplies = createQuickReplies;
function createButtons(buttons) {
    return R.reject(R.isNil)(R.map((button) => {
        const title = button.content || button.name;
        if (!button.mediaType) {
            return {
                payload: button.url,
                title,
                type: 'postback',
            };
        }
        else if (button.mediaType === 'text/html') {
            return {
                title,
                type: 'web_url',
                url: button.url,
            };
        }
        else if (button.mediaType === 'audio/telephone-event') {
            return {
                payload: button.url,
                title,
                type: 'phone_number',
            };
        }
        else if (button.mediaType === 'broid/share') {
            return {
                type: 'element_share',
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
function createCard(name, content, buttons, imageURL) {
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
exports.createCard = createCard;
function createTextWithButtons(name, content, buttons) {
    return {
        payload: {
            buttons,
            template_type: 'button',
            text: content || name,
        },
        type: 'template',
    };
}
exports.createTextWithButtons = createTextWithButtons;
