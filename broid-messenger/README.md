[![npm][npm]][npm-url]
[![node][node]][node-url]
[![deps][deps]][deps-url]
[![tests][tests]][tests-url]
[![bithound][bithound]][bithound-url]
[![bithoundscore][bithoundscore]][bithoundscore-url]
[![nsp-checked][nsp-checked]][nsp-checked-url]

# Broid Messenger Integration

Broid Integrations is an open source project providing a suite of Activity Streams 2 libraries for unified communications among a vast number of communication platforms.

> Connect your App to Multiple Messaging Channels with  One OpenSource Language.

[![gitter](https://badges.gitter.im/broidHQ/broid.svg)](https://t.broid.ai/c/Blwjlw?utm_source=github&utm_medium=readme&utm_campaign=top&link=gitter)

## Message types supported

| Simple   | Image    | Video  | Buttons  | Location  | Phone number |
|:--------:|:--------:|:------:|:--------:|:---------:|:------------:|
| ✅       | ✅      | ✅     | ✅          | ✅        |              |

_Phone number is platform limitation._

## Getting started

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
| application/vnd.geo+json | location   | Ask for the user location. |
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
sharing your feedback on our [Integrations GitHub Repo](https://github.com/broidhq/integrations) and let's build Broid together!

## Code of Conduct

Make sure that you're read and understand the [Code of Conduct](http://contributor-covenant.org/version/1/2/0/).

## Copyright & License

Copyright (c) 2016-2017 Broid.ai

This project is licensed under the AGPL 3, which can be
[found here](https://www.gnu.org/licenses/agpl-3.0.en.html).

[npm]: https://img.shields.io/badge/npm-broid-green.svg?style=flat
[npm-url]: https://www.npmjs.com/~broid

[node]: https://img.shields.io/node/v/broid-messenger.svg
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
