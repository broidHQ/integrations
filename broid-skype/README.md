[npm]: https://img.shields.io/badge/npm-broid-green.svg?style=flat
[npm-url]: https://www.npmjs.com/org/broid

[node]: https://img.shields.io/node/v/@broid/skype.svg
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

# Broid Skype Integration

Broid Integrations is an open source project providing a suite of Activity Streams 2 libraries for unified communications among a vast number of communication platforms.

> Connect your App to Multiple Messaging Channels with  One OpenSource Language.

[![gitter](https://badges.gitter.im/broidHQ/broid.svg)](https://t.broid.ai/c/Blwjlw?utm_source=github&utm_medium=readme&utm_campaign=top&link=gitter)

## Message types supported

| Simple | Image | Video | Buttons | Location | Phone number |
|:------:|:-----:|:-----:|:-------:|:--------:|:------------:|
|   ✅    |   ✅   |   ✅   |    ✅    |          |              |

_Location, Phone number are platform limitations._

## Getting started

### Install

```bash
npm install --save @broid/skype
```

### Connect to Skype

```javascript
const BroidSkype = require('@broid/skype');

const skype = new BroidSkype({
  token: 'xxxxx',
  tokenSecret: 'xxxxxx',
});

skype.connect()
  .subscribe({
    next: data => console.log(data),
    error: err => console.error(`Something went wrong: ${err.message}`),
    complete: () => console.log('complete'),
  });
```

**Options available**

| name             | Type     | default    | Description  |
| ---------------- |:--------:| :--------: | --------------------------|
| token            | string   |      |  |
| token_secret     | string   |      |  |
| service_id       | string   | random     | Arbitrary identifier of the running instance |
| log_level        | string   | `debug`    | Can be : `fatal`, `error`, `warn`, `info`, `debug`, `trace` |
| http             | object   | `{ "port": 8080, "http": "127.0.0.1" }` | HTTP options (`host`, `port`) |


### Receive a message

```javascript
skype.listen()
  .subscribe({
    next: data => console.log(`Received message: ${data}`),
    error: err => console.error(`Something went wrong: ${err.message}`),
    complete: () => console.log('complete'),
  });
```

## Buttons supported

| mediaType        | Action types  | Content of value property  |
| ---------------- |:-------------:| --------------------------|
| text/html        | open-url      | URL to be opened in the built-in browser. |
| audio/telephone-event | call     | Destination for a call in following format: "tel:123123123123". |
|                       | imBack   | Text of message which client will sent back as ordinary chat message. |

### Post a message

To send a message, the format should use the [broid-schemas](https://github.com/broidHQ/integrations/tree/master/integrations/broid-schemas).

```javascript
const formatted_message = {
  "@context": "https://www.w3.org/ns/activitystreams",
  "type": "Create",
  "generator": {
    "id": "f6e92eb6-f69e-4eae-8158-06613461cf3a",
    "type": "Service",
    "name": "skype"
  },
  "object": {
    "type": "Note",
    "content": "hello world",
    "context": {
      "type": "Object",
      "name": "address_id",
      "content": "xxxxxxx#29:xxxxxxxxxxxx#skype#28:xxxxxxxxxxxx"
    }
  },
  "to": {
    "type": "Person",
    "id": "2932680234"
  }
};

skype.send(formatted_message)
  .then(() => console.log("ok"))
  .catch(err => console.error(err));
```

## Examples of messages

### Message received

- A simple direct message received from Sally

```json
{
  "@context": "https://www.w3.org/ns/activitystreams",
  "type": "Create",
  "published": 1482903365195,
  "generator": {
    "id": "f6e92eb6-f69e-4eae-8158-06613461cf3a",
    "type": "Service",
    "name": "skype"
  },
  "actor": {
    "type": "Person",
    "name": "Sally",
    "id": "2932680234"
  },
  "object": {
    "type": "Note",
    "content": "hello world",
    "id": "814382944357937155",
    "context": {
      "type": "Object",
      "content": "xxxxxxx#29:xxxxxxx#skype#28:xxxxxxxx"
    }
  },
  "target": {
    "type": "Person",
    "name": "MyBot",
    "id": "1132680234"
  }
}
```

- A image received from Sally

```json
{
 "@context": "https://www.w3.org/ns/activitystreams",
 "published": 1483147401733,
 "type": "Create",
 "generator": {
   "id": "bf4ef3de-486b-40ea-80e1-e8d5af86d81c",
   "type": "Service",
   "name": "skype"
 },
 "actor": {
   "id": "29:xxxxxxxxx",
   "type": "Person",
   "name": "Sally"
 },
 "target": {
   "type": "Person",
   "name": "MyBot",
   "id": "28:xxxxxxxxxxxx"
 },
 "object": {
   "type": "Image",
   "id": "1483147401729",
   "context": {
     "type": "Object",
     "name": "address_id",
     "content": "xxxxxxx#29:xxxxxxxxxxxx#skype#28:xxxxxxxxxxxx"
   },
   "url": "https://apis.skype.com/v2/attachments/0-cus-d1-432cb4158e59c36bc0814217ecf46318/views/original",
   "mediaType": "image/jpeg",
   "name": "image_name.jpg"
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
    "name": "skype"
  },
  "object": {
    "type": "Note",
    "content": "hello world",
    "context": {
      "type": "Object",
      "name": "address_id",
      "content": "xxxxxxx#29:xxxxxxxxxxxx#skype#28:xxxxxxxxxxxx"
    }
  },
  "to": {
    "type": "Person",
    "id": "2932680234"
  }
}
```

- Send a Image, Video

```json
{
  "@context": "https://www.w3.org/ns/activitystreams",
  "type": "Create",
  "generator": {
    "id": "f6e92eb6-f69e-4eae-8158-06613461cf3a",
    "type": "Service",
    "name": "skype"
  },
  "object": {
    "content": "hello world",
    "type": "Image",
    "url": "https://unsplash.it/200/300",
    "context": {
      "type": "Object",
      "name": "address_id",
      "content": "xxxxxxx#29:xxxxxxxxxxxx#skype#28:xxxxxxxxxxxx"
    }    
  },
  "to": {
    "type": "Person",
    "id": "2932680234"
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
    "name": "skype"
  },
  "object": {
    "type": "Note",
    "content": "hello world",
    "attachment": [{
        "type": "Button",
        "content": "Broid's website",
        "name": "broid",
        "mediaType": "text/html",
        "url": "https://www.broid.ai"
    }, {
        "type": "Button",
        "content": "Falken's Maze",
        "name": "maze",
        "url": "value_maze"
    }],
    "context": {
      "type": "Object",
      "name": "address_id",
      "content": "xxxxxxx#29:xxxxxxxxxxxx#skype#28:xxxxxxxxxxxx"
    }    
  },
  "to": {
    "type": "Person",
    "id": "2932680234"
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
