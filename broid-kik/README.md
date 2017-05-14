[npm]: https://img.shields.io/badge/npm-broid-green.svg?style=flat
[npm-url]: https://www.npmjs.com/org/broid

[node]: https://img.shields.io/node/v/@broid/kik.svg
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

# Broid Kik Integration

Broid Integrations is an open source project providing a suite of Activity Streams 2 libraries for unified communications among a vast number of communication platforms.

> Connect your App to Multiple Messaging Channels with  One OpenSource Language.

[![gitter](https://badges.gitter.im/broidHQ/broid.svg)](https://t.broid.ai/c/Blwjlw?utm_source=github&utm_medium=readme&utm_campaign=top&link=gitter)

## Message types supported

| Simple | Image | Video | Buttons | Location | Phone number |
|:------:|:-----:|:-----:|:-------:|:--------:|:------------:|
|   ✅    |   ✅   |   ✅   |         |          |              |

_Buttons, Location, Phone number are platform limitations._

## Getting started

### Install

```bash
npm install --save @broid/kik
```

### Connect to Kik

```javascript
const BroidKik = require('@broid/kik');

const kik = new broidKik({
  username: "<not_name>",
  token: "<api_key>",
  webhookURL: "http://example.com/"
  http: {
    host: "0.0.0.0",
    port: 8080
  }
});

kik.connect()
  .subscribe({
    next: data => console.log(data),
    error: err => console.error(`Something went wrong: ${err.message}`),
    complete: () => console.log('complete'),
  });
```

Kik can also be used with your existing express setup.

```javascript
const BroidKik = require('@broid/kik');
const express = require("express");

const kik = new broidKik({
  username: "<not_name>",
  token: "<api_key>",
  webhookURL: "http://example.com/"
});

kik.connect()
  .subscribe({
    next: data => console.log(data),
    error: err => console.error(`Something went wrong: ${err.message}`),
    complete: () => console.log('complete'),
  });

const app = express();
app.use("/kik", kik.getRouter());
app.listen(8080);
```

**Options available**

| name             | Type     | default    | Description  |
| ---------------- |:--------:| :--------: | --------------------------|
| serviceID       | string   | random     | Arbitrary identifier of the running instance |
| logLevel        | string   | `info`     | Can be : `fatal`, `error`, `warn`, `info`, `debug`, `trace` |
| token           | string  |            | Your API Key |
| username         | string   |            | Your bot name |
| http             | object   | `{ "port": 8080, "http": "0.0.0.0", "webhookURL": "127.0.0.1" }` | WebServer options (`host`, `port`, `webhookURL`) |

### Buttons supported

Kik support simple quick reply button

### Receive a message

```javascript
kik.listen()
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
    "name": "kik"
  },
  "object": {
    "type": "Note",
    "content": "hello world"
  },
  "to": {
    "type": "Person",
    "id": "sally2"
  }
};

kik.send(formatted_message)
  .then(() => console.log("ok"))
  .catch(err => console.error(err));
```

## Examples of messages

### Message received

- A message received from Sally

```json
{
  "@context": "https://www.w3.org/ns/activitystreams",
  "published": 1483677146,
  "type": "Create",
  "generator": {
    "id": "67c9cb10-8a74-42c8-ba55-294d0447cdf9",
    "type": "Service",
    "name": "kik"
  },
  "actor": {
    "id": "Sally Doe",
    "type": "Person",
    "name": "sally2"
  },
  "target": {
    "id": "e03458b44ed4d35823917871a5c62865428a7f900aa14a0ef57ee24c4cbb7b62d",
    "type": "Person",
    "name": ""
  },
  "object": {
    "type": "Note",
    "id": "f59bee1c-d519-402f-8933-e548cdbd6f4e",
    "content": "Hello world"
  }
}
```

- A video/image received from Sally

```json
{
  "@context": "https://www.w3.org/ns/activitystreams",
  "published": 1483677146,
  "type": "Create",
  "generator": {
    "id": "67c9cb10-8a74-42c8-ba55-294d0447cdf9",
    "type": "Service",
    "name": "kik"
  },
  "actor": {
    "id": "Sally Doe",
    "type": "Person",
    "name": "sally2"
  },
  "target": {
    "id": "e03458b44ed4d35823917871a5c62865428a7f900aa14a0ef57ee24c4cbb7b62d",
    "type": "Person",
    "name": ""
  },
  "object": {
  "type": "Image",
  "id": "f59bee1c-d519-402f-8933-e548cdbd6f4e",
  "url": "http://images.nationalgeographic.com/wpf/media-live/photos/000/090/cache/african-elephant-standing_9033_600x450.jpg"
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
    "name": "kik"
  },
  "object": {
    "type": "Note",
    "content": "hello world"
  },
  "to": {
    "type": "Person",
    "id": "sally2"
  }
}
```

- Send a message with quick reply buttons

```json
{
  "@context": "https://www.w3.org/ns/activitystreams",
  "type": "Create",
  "generator": {
    "id": "f6e92eb6-f69e-4eae-8158-06613461cf3a",
    "type": "Service",
    "name": "kik"
  },
  "object": {
    "type": "Note",
    "content": "hello world",
    "attachment": [
      {
        "type": "Button",
        "name": "How are you?",
        "url": "How are you?",
      }
    ]
  },
  "to": {
    "type": "Person",
    "id": "sally2"
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
    "name": "kik"
  },
  "object": {
    "type": "Image",
    "content": "hello world",
    "url": "https://www.broid.ai/images/fake.png",
    "preview": "https://www.broid.ai/images/fake.png"
  },
  "to": {
    "type": "Person",
    "id": "sally2"
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
    "name": "kik"
  },
  "object": {
    "type": "Video",
    "content": "hello world",
    "url": "https://www.broid.ai/videos/echo-hereweare.mp4",
    "preview": "https://www.broid.ai/images/fake.png"
  },
  "to": {
    "type": "Person",
    "id": "sally2"
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
