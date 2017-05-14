[npm]: https://img.shields.io/badge/npm-broid-green.svg?style=flat
[npm-url]: https://www.npmjs.com/org/broid

[node]: https://img.shields.io/node/v/@broid/twitter.svg
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

# Broid Twitter Integration

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
npm install --save @broid/twitter
```

### Connect to Twitter

```javascript
const BroidTwitter = require('@broid/twitter');

const twitter = new BroidTwitter({
  username: '@mention',
  token: "<access_token>",
  tokenSecret: "<access_secret>",
  consumerSecret: "<consumer_secret>",
  consumerKey: "<consumer_key>"
});

twitter.connect()
  .subscribe({
    next: data => console.log(data),
    error: err => console.error(`Something went wrong: ${err.message}`),
    complete: () => console.log('complete'),
  });
```

**Options available**

| name             | Type     | default    | Description  |
| ---------------- |:--------:| :--------: | --------------------------|
| serviceID       | string   | random     | Arbitrary identifier of the running instance |
| logLevel        | string   | `info`     | Can be : `fatal`, `error`, `warn`, `info`, `debug`, `trace` |
| token           | string   |            | Your access token |
| tokenSecret     | string   |            | Your access token secret |
| consumerSecret  | string   |            | Your consumer secret |
| consumerKey     | string   |            | Your consumer key |
| username        | string   |            | Your username to listen Twitter mention |


### Receive a message

```javascript
twitter.listen()
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
    "name": "twitter"
  },
  "object": {
    "type": "Note",
    "content": "hello world"
  },
  "to": {
    "type": "Person",
    "id": "152486124831181614"
  }
};

twitter.send(formatted_message)
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
    "name": "twitter"
  },
  "actor": {
    "id": "2932680926",
    "type": "Person",
    "name": "Sally Dude"
  },
  "target": {
    "id": "248881752",
    "type": "Person",
    "name": "John Dow"
  },
  "object": {
    "type": "Note",
    "id": "816859333602508803",
    "content": "hello world"
  }
}
```

- A message received from Sally with @mention

```json
{
  "@context": "https://www.w3.org/ns/activitystreams",
  "published": 1483590793,
  "type": "Create",
  "generator": {
    "id": "55c5e6a2-a1a3-4fc6-b94a-7011d9faa0a2",
    "type": "Service",
    "name": "twitter"
  },
  "actor": {
    "id": "2932680926",
    "type": "Person",
    "name": "Sally Dude"
  },
  "target": {
    "id": "248881752",
    "type": "Group",
    "name": "John Dow"
  },
  "object": {
    "type": "Note",
    "id": "816865109930819584",
    "content": "hello world"
  }
}
```

- A video received from Sally

```json
{
  "@context": "https://www.w3.org/ns/activitystreams",
  "published": 1483589499,
  "type": "Create",
  "generator": {
    "id": "73301570-7ec7-45ce-b035-2ff4831306ab",
    "type": "Service",
    "name": "twitter"
  },
  "actor": {
    "id": "2932680926",
    "type": "Person",
    "name": "Sally Dude"
  },
  "target": {
    "id": "248881752",
    "type": "Person",
    "name": "John Doe"
  },
  "object": {
    "type": "Video",
    "id": "816859677984260103",
    "content": "hello gif",
    "mediaType": "video/mp4",
    "url": "https://video.twimg.com/dm_gif/816859666814636032/zZvU_moKWIoIkdgnNul9mNV9X9oZNLnjZT7eBIf9tvraGBSObs.mp4"
  }
}
```

- A image received from Sally

```json
{
  "@context": "https://www.w3.org/ns/activitystreams",
  "published": 1483589694,
  "type": "Create",
  "generator": {
    "id": "7e6bc29e-7227-45c6-b227-1ddeb3a26fba",
    "type": "Service",
    "name": "twitter"
  },
  "actor": {
    "id": "2932680926",
    "type": "Person",
    "name": "Sally Dude"
  },
  "target": {
    "id": "248881752",
    "type": "Person",
    "name": "John Doe"
  },
  "object": {
    "type": "Image",
    "id": "816860497685397507",
    "content": "hello image",
    "mediaType": "image/jpeg",
    "url": "https://ton.twitter.com/1.1/ton/data/dm/816860497685397507/816860476374032384/Vr0Zlpy3.jpg"
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
    "name": "twitter"
  },
  "object": {
    "type": "Note",
    "content": "hello world"
  },
  "to": {
    "type": "Person",
    "id": "152486124831181614"
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
    "name": "twitter"
  },
  "object": {
    "type": "Image",
    "content": "hello world",
    "url": "https://www.broid.ai/images/fake.png"
  },
  "to": {
    "type": "Person",
    "id": "152486124831181614"
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
