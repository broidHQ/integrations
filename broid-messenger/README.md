# [Broid Messenger Parser](https://github.com/broidhq/integrations) &middot; [![Build Status](https://travis-ci.org/broidHQ/broid-messenger.svg?branch=master)](https://travis-ci.org/broidHQ/broid-messenger) [![npm version](https://img.shields.io/npm/v/broid-messenger.svg?style=flat)](https://www.npmjs.com/package/broid-messenger) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/broidHQ/integrations) [![CLA assistant](https://cla-assistant.io/readme/badge/broidhq/integrations)](https://cla-assistant.io/broidhq/integrations)

Broid _Integrations_ is an **open source project** providing a suite of [Activity Streams 2](https://www.w3.org/TR/activitystreams-core/) libraries for unified communications among a vast number of communication platforms.

**Feeback or features request are welcome. Go to https://github.com/broidhq/integrations**

## Getting started

- `connect` and `listen` method return [a observable](http://reactivex.io/rxjs/).

- `send` method return [a promise](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/Promise)

### Connect to Messenger

```javascript
import broidMessenger from 'broid-messenger'

const messenger = new broidMessenger({
  token: "<oauth_token>",
  tokenSecret: "<verify_token>"
})

messenger.connect()
  .subscribe({
    next: data => console.log(data),
    error: err => console.error(`Something went wrong: ${err.message}`),
    complete: () => console.log('complete'),
  })
```

**Options availables**

| name             | Type     | default    | Description  |
| ---------------- |:--------:| :--------: | --------------------------|
| serviceID        | string   | random     | Arbitrary identifier of the running instance |
| logLevel         | string   | `info`     | Can be : `fatal`, `error`, `warn`, `info`, `debug`, `trace` |
| token            | string   |            | Your account oauth token |
| tokenSecret      | string   |            | Your auth verify token |
| http             | object   | `{ "port": 8080, "http": "0.0.0.0" }` | WebServer options (`host`, `port`) |

### Receive a message

```javascript
messenger.listen()
  .subscribe({
    next: data => console.log(`Received message: ${data}`),
    error: err => console.error(`Something went wrong: ${err.message}`),
    complete: () => console.log('complete'),
  })
```

## Buttons supported

| mediaType             | Action types  | Content of value property |
| --------------------- |:-------------:| --------------------------|
| text/html             | web_url       | URL to be opened in the built-in browser. |
| audio/telephone-event | phone_number  | Destination for a call in following format: "tel:123123123123". |
|                       | postback   | Text of message which client will sent back as ordinary chat message. |

### Not supported yet

|            | Action types   | Content of value property |
| ---------- |:--------------:| --------------------------|
|            | element_share  | Open a share dialog in Messenger. |
|            | payment        |  Opens a checkout dialog to enables purchases. |
|            | account_link   |  Sync the user account. |
|            | account_unlink |  Un sync the user account. |

### Post a message

To send a message, the format should use the [broid-schemas](https://github.com/broidHQ/integrations/tree/master/integrations/broid-schemas).

```javascript
const message_formated = '...'

messenger.send(message_formated)
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
    "name": "messenger"
  },
  "actor": {
    "id": "1326251318",
    "type": "Person",
    "name": "Sally Doe"
  },
  "target": {
    "id": "1396343657196792",
    "name": "1396343657196792",
    "type": "Person"
  },
  "object": {
    "type": "Note",
    "id": "mid.1483842234615:9552e41189",
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
    "name": "messenger"
  },
  "actor": {
    "id": "1326251318",
    "type": "Person",
    "name": "Sally Doe"
  },
  "target": {
    "id": "1396343657196792",
    "name": "1396343657196792",
    "type": "Person"
  },
  "object": {
    "type": "Image",
    "id": "mid.1483842234615:9552e41189",
    "url": "http://images.nationalgeographic.com/wpf/media-live/photos/000/090/cache/african-elephant-standing_9033_600x450.jpg",
    "mediaType": "image/jpeg"
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
    "name": "messenger"
  },
  "object": {
    "type": "Note",
    "content": "hello world"
  },
  "to": {
    "type": "Person",
    "id": "1396343657196792"
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
    "name": "messenger"
  },
  "object": {
    "type": "Image",
    "content": "hello world",
    "url": "https://www.broid.ai/images/fake.png"
  },
  "to": {
    "type": "Person",
    "id": "1396343657196792"
  }
}
```

- Send quick reply message

```json
{
  "@context": "https://www.w3.org/ns/activitystreams",
  "type": "Create",
  "generator": {
    "id": "f6e92eb6-f69e-4eae-8158-06613461cf3a",
    "type": "Service",
    "name": "messenger"
  },
  "object": {
    "type": "Note",
    "content": "hello world",
    "attachment": [{
        "type": "Button",
        "name": "broid",
        "mediaType": "text/html",
        "url": "https://www.broid.ai"
    }, {
        "type": "Button",
        "name": "Green",
        "url": "DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_GREEN"
    }]  
  },
  "to": {
    "type": "Person",
    "id": "1396343657196792"
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
