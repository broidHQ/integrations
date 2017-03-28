"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const R = require("ramda");
const request = require("request-promise");
const baseURL = 'https://api.groupme.com/v3';
function getMessages(token, groupId) {
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
exports.getMessages = getMessages;
function getMembers(token, groupId) {
    return request({
        json: 'true',
        qs: {
            token,
        },
        uri: `${baseURL}/groups/${groupId}`,
    }).then((res) => res.response.members);
}
exports.getMembers = getMembers;
function getGroups(token) {
    return request({
        json: 'true',
        qs: {
            token,
        },
        uri: `${baseURL}/groups`,
    }).then((res) => res.response);
}
exports.getGroups = getGroups;
function postMessage(token, payload) {
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
            .pipe(request
            .post('https://image.groupme.com/pictures', { json: true, qs: { access_token: token } }))
            .then((res) => {
            const url = R.path(['payload', 'url'], res);
            if (!url) {
                throw new Error('Image URL should exist.');
            }
            return url;
        })
            .then((url) => {
            payload.picture_url = url;
            return post(payload);
        });
    }
    return post(payload);
}
exports.postMessage = postMessage;
