# [Broid Twitter Parser](https://github.com/broidhq/feedhack) &middot; [![Build Status](https://travis-ci.org/broidHQ/broid-twitter.svg?branch=master)](https://travis-ci.org/broidHQ/broid-twitter) [![npm version](https://img.shields.io/npm/v/broid-twitter.svg?style=flat)](https://www.npmjs.com/package/broid-twitter) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/broidHQ/feedhack) [![CLA assistant](https://cla-assistant.io/readme/badge/broidhq/broid-twitter)](https://cla-assistant.io/broidhq/broid-twitter)

Broid _Integrations_ is an **open source project** providing a suite of [Activity Streams 2](https://www.w3.org/TR/activitystreams-core/) libraries for unified communications among a vast number of communication platforms.

**Feeback or features request are welcome. Go to https://github.com/broidhq/feedhack**

## Getting started

- `connect` and `listen` method return [a observable](http://reactivex.io/rxjs/).

- `send` method return [a promise](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/Promise)

### Connect to Twitter

```javascript
import broidTwitter from 'broid-twitter'

const twitter = new broidTwitter({
  username: '@mention',
  token: "<access_token>",
  tokenSecret: "<access_secret>",
  consumerSecret: "<consumer_secret>",
  consumerKey: "<consumer_key>"
})

twitter.connect()
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
  })
```

### Post a message

To send a message, the format should use the [broid-schemas](https://github.com/broidhq/broid-schemas).

```javascript
const message_formated = '...'

twitter.send(message_formated)
  .then(() => console.log("ok"))
  .catch(err => console.error(err))
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
sharing your feedback on our [Feedhack GitHub Repo](https://github.com/broidhq/feedhack) and let's build Broid together!

## Code of Conduct

Make sure that you're read and understand the [Code of Conduct](http://contributor-covenant.org/version/1/2/0/).

## CLA

To protect the interests of the Broid contributors, Broid, customers and end users we require contributors to sign a [Contributors License Agreement](https://cla-assistant.io/broidhq/broid-twitter) (CLA) before we pull the changes into the main repository. [Our CLA](https://cla-assistant.io/broidhq/broid-twitter) is simple and straightforward - it requires that the contributions you make to any Broid open source project are properly licensed and that you have the legal authority to make those changes. This helps us significantly reduce future legal risk for everyone involved. It's easy---no faxing or printing required!

You can digitally sign the [CLA online](https://cla-assistant.io/broidhq/broid-twitter). Please indicate your email address in your first pull request so that we can make sure that will locate your CLA. Once you've submitted it, you no longer need to send one for subsequent submissions.

## Copyright & License

Copyright (c) 2016-2017 Broid.ai

This project is licensed under the AGPL 3, which can be
[found here](https://www.gnu.org/licenses/agpl-3.0.en.html).
