# [Broid Viber Parser](https://github.com/broidhq/feedhack) &middot; [![Build Status](https://travis-ci.org/broidHQ/broid-viber.svg?branch=master)](https://travis-ci.org/broidHQ/broid-viber) [![npm version](https://img.shields.io/npm/v/broid-viber.svg?style=flat)](https://www.npmjs.com/package/broid-viber) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/broidHQ/feedhack) [![CLA assistant](https://cla-assistant.io/readme/badge/broidhq/feedhack)](https://cla-assistant.io/broidhq/feedhack)

Broid _Integrations_ is an **open source project** providing a suite of [Activity Streams 2](https://www.w3.org/TR/activitystreams-core/) libraries for unified communications among a vast number of communication platforms.

**Feeback or features request are welcome. Go to https://github.com/broidhq/feedhack**

## Getting started

- `connect` and `listen` method return [a observable](http://reactivex.io/rxjs/).

- `send` method return [a promise](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/Promise)

### Connect to Viber

```javascript
import broidViber from 'broid-viber'

const viber = new broidViber({
  username: '<sender_name>',
  token: "<app_key>",
  http: {
    webhookURL: "http://127.0.0.1/"
  }
})

viber.connect()
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
| token            | string   |            | Your application key |
| username         | string   |            | Your public page name |
| http             | object   | `{ "port": 8080, "http": "0.0.0.0", "webhookURL": "127.0.0.1" }` | WebServer options (`host`, `port`, `webhookURL`) |

### Receive a message

```javascript
viber.listen()
  .subscribe({
    next: data => console.log(`Received message: ${data}`),
    error: err => console.error(`Something went wrong: ${err.message}`),
    complete: () => console.log('complete'),
  })
```

### Post a message

To send a message, the format should use the [broid-schemas](https://github.com/broidHQ/feedhack/tree/master/integrations/broid-schemas).

```javascript
const message_formated = '...'

viber.send(message_formated)
  .then(() => console.log("ok"))
  .catch(err => console.error(err))
```



## Examples of messages

### Message received

- A message received from Sally

```json
{
  "@context": "https://www.w3.org/ns/activitystreams",
  "actor": {
    "id": "8GBB3nlCwffk8SQm1zmcAA==",
    "name": "Sally",
    "type": "Person"
  },
  "generator": {
    "id": "5c27ca30-5070-4290-a30a-d178ebf467c9",
    "name": "viber",
    "type": "Service"
  },
  "object": {
    "content": "Hello world",
    "id": "5000186376024662000",
    "type": "Note"
  },
  "published": 1484195107,
  "target": {
    "id": "8GBB3nlCwffk8SQm1zmcAA==",
    "name": "Sally",
    "type": "Person"
  },
  "type": "Create"
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
    "name": "viber"
  },
  "actor": {
    "id": "8GBB3nlCwffk8SQm1zmcAA==",
    "name": "Sally",
    "type": "Person"
  },
  "target": {
    "id": "8GBB3nlCwffk8SQm1zmcAA==",
    "name": "Sally",
    "type": "Person"
  },
  "object": {
  "type": "Image",
  "id": "358c14836772801482I5g3Jjko7RWp6M",
  "url": "url_of_file",
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
    "name": "viber"
  },
  "object": {
    "type": "Note",
    "content": "hello world"
  },
  "to": {
    "id": "8GBB3nlCwffk8SQm1zmcAA==",
    "name": "Sally"
  }
}
```

- Send a image, video

```json
{
  "@context": "https://www.w3.org/ns/activitystreams",
  "type": "Create",
  "generator": {
    "id": "f6e92eb6-f69e-4eae-8158-06613461cf3a",
    "type": "Service",
    "name": "viber"
  },
  "object": {
    "type": "Image",
    "content": "hello world",
    "url": "https://www.broid.ai/images/fake.png"
  },
  "to": {
    "id": "8GBB3nlCwffk8SQm1zmcAA==",
    "name": "Sally"
  }
}
```

- Send a location

```json
{
  "@context": "https://www.w3.org/ns/activitystreams",
  "type": "Create",
  "generator": {
    "id": "f6e92eb6-f69e-4eae-8158-06613461cf3a",
    "type": "Service",
    "name": "viber"
  },
  "object": {
    "type": "Place",
    "latitude": 45.53192,
    "longitude": -73.55304
  },
  "to": {
    "id": "8GBB3nlCwffk8SQm1zmcAA==",
    "name": "Sally"
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
    "name": "viber"
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
    }]
  },
  "to": {
    "id": "8GBB3nlCwffk8SQm1zmcAA==",
    "name": "Sally"
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

To protect the interests of the Broid contributors, Broid, customers and end users we require contributors to sign a [Contributors License Agreement](https://cla-assistant.io/broidhq/feedhack) (CLA) before we pull the changes into the main repository. [Our CLA](https://cla-assistant.io/broidhq/feedhack) is simple and straightforward - it requires that the contributions you make to any Broid open source project are properly licensed and that you have the legal authority to make those changes. This helps us significantly reduce future legal risk for everyone involved. It's easy---no faxing or printing required!

You can digitally sign the [CLA online](https://cla-assistant.io/broidhq/feedhack). Please indicate your email address in your first pull request so that we can make sure that will locate your CLA. Once you've submitted it, you no longer need to send one for subsequent submissions.

## Copyright & License

Copyright (c) 2016-2017 Broid.ai

This project is licensed under the AGPL 3, which can be
[found here](https://www.gnu.org/licenses/agpl-3.0.en.html).
