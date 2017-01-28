# [Broid Kik Parser](https://github.com/broidhq/integrations) &middot; [![Build Status](https://travis-ci.org/broidHQ/broid-kik.svg?branch=master)](https://travis-ci.org/broidHQ/broid-kik) [![npm version](https://img.shields.io/npm/v/broid-kik.svg?style=flat)](https://www.npmjs.com/package/broid-kik) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/broidHQ/integrations) [![CLA assistant](https://cla-assistant.io/readme/badge/broidhq/integrations)](https://cla-assistant.io/broidhq/integrations)

Broid _Parsers_ is an **open source project** providing a suite of [Activity Streams 2](https://www.w3.org/TR/activitystreams-core/) libraries for unified communications among a vast number of communication platforms.

**Feeback or features request are welcome. Go to https://github.com/broidhq/integrations**

## Getting started

- `connect` and `listen` method return [a observable](http://reactivex.io/rxjs/).

- `send` method return [a promise](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/Promise)

### Connect to Kik

```javascript
import broidKik from 'broid-kik'

const kik = new broidKik({
  username: '<not_name>',
  token: "<api_key>",
  http: {
    webhookURL: "http://127.0.0.1/"
  }
})

kik.connect()
  .subscribe({
    next: data => console.log(data),
    error: err => console.error(`Something went wrong: ${err.message}`),
    complete: () => console.log('complete'),
  })
```

**Options availables**

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
  })
```

### Post a message

To send a message, the format should use the [broid-schemas](https://github.com/broidHQ/integrations/tree/master/integrations/broid-schemas).

```javascript
const message_formated = '...'

kik.send(message_formated)
  .then(() => console.log("ok"))
  .catch(err => console.error(err))
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
sharing your feedback on our [integrations GitHub Repo](https://github.com/broidhq/integrations) and let's build Broid together!

## Code of Conduct

Make sure that you're read and understand the [Code of Conduct](http://contributor-covenant.org/version/1/2/0/).

## CLA

To protect the interests of the Broid contributors, Broid, customers and end users we require contributors to sign a [Contributors License Agreement](https://cla-assistant.io/broidhq/integrations) (CLA) before we pull the changes into the main repository. [Our CLA](https://cla-assistant.io/broidhq/integrations) is simple and straightforward - it requires that the contributions you make to any Broid open source project are properly licensed and that you have the legal authority to make those changes. This helps us significantly reduce future legal risk for everyone involved. It's easy---no faxing or printing required!

You can digitally sign the [CLA online](https://cla-assistant.io/broidhq/integrations). Please indicate your email address in your first pull request so that we can make sure that will locate your CLA. Once you've submitted it, you no longer need to send one for subsequent submissions.

## Copyright & License

Copyright (c) 2016-2017 Broid.ai

This project is licensed under the AGPL 3, which can be
[found here](https://www.gnu.org/licenses/agpl-3.0.en.html).
