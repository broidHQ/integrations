[npm]: https://img.shields.io/badge/npm-broid-green.svg?style=flat
[npm-url]: https://www.npmjs.com/org/broid

[node]: https://img.shields.io/node/v/@broid/wechat.svg
[node-url]: https://nodejs.org

[deps]: https://img.shields.io/badge/dependencies-checked-green.svg?style=flat
[deps-url]: #integrations

[tests]: https://img.shields.io/travis/broidHQ/integrations/master.svg
[tests-url]: https://travis-ci.org/broidHQ/integrations

[bithound]: https://img.shields.io/bithound/code/github/broidHQ/integrations.svg
[bithound-url]: https://www.bithound.io/github/broidHQ/integrations

[bithoundscore]: https://www.bithound.io/github/broidHQ/integrations/badges/score.svg
[bithoundscore-url]: https://www.bithound.io/github/broidHQ/integrations

[nsp-checked]: https://img.shields.io/badge/nsp-checked-green.svg?style=flat
[nsp-checked-url]: https://nodesecurity.io

[![npm][npm]][npm-url]
[![node][node]][node-url]
[![deps][deps]][deps-url]
[![tests][tests]][tests-url]
[![bithound][bithound]][bithound-url]
[![bithoundscore][bithoundscore]][bithoundscore-url]
[![nsp-checked][nsp-checked]][nsp-checked-url]

# Broid Wechat Integration

Broid Integrations is an open source project providing a suite of Activity Streams 2 libraries for unified communications among a vast number of communication platforms.

> Connect your App to Multiple Messaging Channels with  One OpenSource Language.

[![gitter](https://badges.gitter.im/broidHQ/broid.svg)](https://t.broid.ai/c/Blwjlw?utm_source=github&utm_medium=readme&utm_campaign=top&link=gitter)

## Message types supported

| Simple | Image | Video | Audio | Buttons | Location | Phone number |
|:------:|:-----:|:-----:|:-------:|:-------:|:--------:|:------------:|
|   ✅    |   ✅   |   ✅   |   ✅            |          |              |

_Buttons, Location, Phone number are platform limitations._

_Image, Video, and Audio are supported as a simple message_.

## Getting started

### Install

```bash
npm install --save @broid/wechat
```

### Connect to Twitter

```javascript
const BroidWeChat = require('@broid/wechat');

const wechat = new BroidWeChat({
  appID: '',
  appSecret: '',
  http: {
    host: "127.0.0.1",
    port: 8080
  }
});

wechat.connect()
  .subscribe({
    next: data => console.log(data),
    error: err => console.error(`Something went wrong: ${err.message}`),
    complete: () => console.log('complete'),
  });
```

WeChat can also be used with your existing express setup.

```javascript
const BroidWeChat = require('broid-wechat');
const express = require("express");

const wechat  = new BroidWeChat({
  appID: '',
  appSecret: '',
});

const app = express();
app.use("/wechat", wechat.getRouter());

wechat.connect()
  .subscribe({
    next: data => console.log(data),
    error: err => console.error(`Something went wrong: ${err.message}`),
    complete: () => console.log('complete'),
  });

app.listen(8080);
```

**Options available**

| name              | Type     | default    | Description  |
| ----------------- |:--------:| :--------: | --------------------------|
| serviceID         | string   | random     | Arbitrary identifier of the running instance |
| logLevel          | string   | `info`     | Can be : `fatal`, `error`, `warn`, `info`, `debug`, `trace` |
| http              | object   |            | WebServer options (`host`, `port`, `webhookURL`) |

### Receive a message

```javascript
wechat.listen()
  .subscribe({
    next: data => console.log(`Received message: ${data}`),
    error: err => console.error(`Something went wrong: ${err.message}`),
    complete: () => console.log('complete'),
  });
```

### Post a message

To send a message, the format should use the [broid-schemas](https://github.com/broidHQ/integrations/tree/master/broid-schemas).

```javascript
const formatted_message = {
  "@context": "https://www.w3.org/ns/activitystreams",
  "type": "Create",
  "generator": {
    "id": "f6e92eb6-f69e-4eae-8158-06613461cf3a",
    "type": "Service",
    "name": "wechat"
  },
  "object": {
    "type": "Note",
    "content": "hello world"
  },
  "to": {
    "type": "Group",
    "id": "wechat_user_openid"
  }
};

wechat.send(formatted_message)
  .then(() => console.log("ok"))
  .catch(err => console.error(err));
```

## Examples of messages

### Message received

- A direct message received from Sally

```json
{
  "@context": "https://www.w3.org/ns/activitystreams",
  "published": 1483589416,
  "type": "Create",
  "generator": {
    "id": "73301570-7ec7-45ce-b035-2ff4831306ab",
    "type": "Service",
    "name": "wechat"
  },
  "actor": {
    "id": "wechat_user_openid",
    "type": "Person",
    "name": "SallyDude"
  },
  "target": {
    "id": "wechat_user_openid",
    "type": "Group",
    "name": "James Doe"
  },
  "object": {
    "type": "Note",
    "id": "73301570-7ec7-45ce-b035-2ff4831306ab",
    "content": "hello world"
  }
}
```

### Send a message

- Send a simple message

```json
{
  "@context": "https://www.w3.org/ns/activitystreams",
  "type": "Create",
  "generator": {
    "id": "f6e92eb6-f69e-4eae-8158-06613461cf3a",
    "type": "Service",
    "name": "wechat"
  },
  "object": {
    "type": "Note",
    "content": "hello world"
  },
  "to": {
    "type": "Person",
    "id": "wechat_user_openid"
  }
}
```

- Send a image

```json
{
  "@context": "https://www.w3.org/ns/activitystreams",
  "type": "Create",
  "generator": {
    "id": "f6e92eb6-f69e-4eae-8158-06613461cf3a",
    "type": "Service",
    "name": "wechat"
  },
  "object": {
    "type": "Image",
    "content": "hello world",
    "url": "https://www.broid.ai/images/fake.png"
  },
  "to": {
    "type": "Person",
    "id": "wechat_user_openid"
  }
}
```

- Send a video

```json
{
  "@context": "https://www.w3.org/ns/activitystreams",
  "type": "Create",
  "generator": {
    "id": "f6e92eb6-f69e-4eae-8158-06613461cf3a",
    "type": "Service",
    "name": "wechat"
  },
  "object": {
    "type": "Video",
    "content": "hello world",
    "url": "https://www.broid.ai/videos/video.mp4"
  },
  "to": {
    "type": "Person",
    "id": "wechat_user_openid"
  }
}
```

- Send a audio clip

```json
{
  "@context": "https://www.w3.org/ns/activitystreams",
  "type": "Create",
  "generator": {
    "id": "f6e92eb6-f69e-4eae-8158-06613461cf3a",
    "type": "Service",
    "name": "wechat"
  },
  "object": {
    "type": "Audio",
    "content": "hello world",
    "url": "https://www.broid.ai/audio/audio.amr"
  },
  "to": {
    "type": "Person",
    "id": "wechat_user_openid"
  }
}
```

# Contributing to Broid

Broid is an open source project. Broid wouldn't be where it is now without contributions by the community. Please consider forking Broid to improve, enhance or fix issues. If you feel like the community will benefit from your fork, please open a pull request.

And because we want to do the better for you. Help us improving Broid by
sharing your feedback on our [Integrations GitHub Repo](https://github.com/broidhq/integrations) and let's build Broid together!

## Code of Conduct

Make sure that you're read and understand the [Code of Conduct](http://contributor-covenant.org/version/1/2/0/).

## Copyright & License

Copyright (c) 2016-2017 Broid.ai

This project is licensed under the AGPL 3, which can be
[found here](https://www.gnu.org/licenses/agpl-3.0.en.html).
