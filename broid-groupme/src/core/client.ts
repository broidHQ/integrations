import * as R from "ramda";
import * as request from "request-promise";

const baseURL = "https://api.groupme.com/v3";

export function getMessages(token, groupId): Promise<any> {
  return request({
    json: "true",
    qs: {
      token,
      limit: 100,
    },
    uri: `${baseURL}/groups/${groupId}/messages`,
  }).then((res) => res.response.messages
    .filter(((msg) => !msg.system)));
}

export function getMembers(token, groupId): Promise<any> {
  return request({
    json: "true",
    qs: {
      token,
    },
    uri: `${baseURL}/groups/${groupId}`,
  }).then((res) => res.response.members);
}

export function getGroups(token): Promise<any> {
  return request({
    json: "true",
    qs: {
      token,
    },
    uri: `${baseURL}/groups`,
  }).then((res) => res.response);
}

export function postMessage(token: string, payload: any): Promise<any> {
  const post = (data) => request({
    json: data,
    method: "POST",
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
      .pipe(request.post("https://image.groupme.com/pictures",
        { json: true, qs: { access_token: token } }))
      .then((res) => {
        const url = R.path(["payload", "url"], res);
        if (!url) { throw new Error("Image URL should exist."); }
        return url;
      })
      .then((url) => {
        payload.picture_url = url;
        return post(payload);
      });
  }

  return post(payload);
}
