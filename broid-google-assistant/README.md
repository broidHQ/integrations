[![npm][npm]][npm-url]
[![node][node]][node-url]
[![deps][deps]][deps-url]
[![tests][tests]][tests-url]
[![bithound][bithound]][bithound-url]
[![bithoundscore][bithoundscore]][bithoundscore-url]
[![nsp-checked][nsp-checked]][nsp-checked-url]

# Broid Google Assistant Integration

Broid Integrations is an open source project providing a suite of Activity Streams 2 libraries for unified communications among a vast number of communication platforms.

> Connect your App to Multiple Messaging Channels with  One OpenSource Language.

[![gitter](https://badges.gitter.im/broidHQ/broid.svg)](https://t.broid.ai/c/Blwjlw?utm_source=github&utm_medium=readme&utm_campaign=top&link=gitter)

## Message types supported

| Simple | Image | Video | Buttons | Location | Phone number |
|:------:|:-----:|:-----:|:-------:|:--------:|:------------:|
|   ✅    |       |       |         |          |              |

_Image, Video, Buttons, Location, Phone number are platform limitations._

## Getting started

### Install

```bash
npm install --save broid-google-assistant
```

### Connect to Google Assistant

```javascript
const BroidGoogleAssistant = require('broid-google-assistant');

const googleAssistant = new BroidGoogleAssistant({
  username: '<your_action_name_here>',
  http: {
    port: 8080,
    host: "0.0.0.0"
  }
});

googleAssistant.connect()
  .subscribe({
    next: data => console.log(data),
    error: err => console.error(`Something went wrong: ${err.message}`),
    complete: () => console.log('complete'),
  });
```

Google Assitant can also be used with your existing express setup.

```javascript
const BroidGoogleAssistant = require('broid-google-assistant');
const express = require("express");

const googleAssistant = new BroidGoogleAssistant({
  username: '<your_action_name_here>',
});

const app = express();
app.use("/googleAssistant", googleAssistant.getRouter());

googleAssistant.connect()
  .subscribe({
    next: data => console.log(data),
    error: err => console.error(`Something went wrong: ${err.message}`),
    complete: () => console.log('complete'),
  });

app.listen(8080);
```

**Options available**

| name            | Type     | default    | Description  |
| --------------- |:--------:| :--------: | --------------------------|
| serviceID       | string   | random     | Arbitrary identifier of the running instance |
| logLevel        | string   | `info`     | Can be : `fatal`, `error`, `warn`, `info`, `debug`, `trace` |
| username        | string   |            | Your action name here |
| http            | object   | `{ "port": 8080, "http": "0.0.0.0" }` | WebServer options (`host`, `port`) |

### Receive a message

```javascript
googleAssistant.listen()
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
    "name": "google-assistant"
  },
  "object": {
    "type": "Note",
    "content": "What is the weather like tomorrow?"
  },
  "to": {
    "id": "IL12J7nWa/2zothSEg46DsY0q7o/H9FUis/YGdp64te=",
    "type": "Person"
  }
};

googleAssistant.send(formatted_message)
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
    "name": "google-assistant"
  },
  "actor": {
    "id": "IL12J7nWa/2zothSEg46DsY0q7o/H9FUis/YGdp64te=",
    "type": "Person"
  },
  "target": {
    "id": "my_action_name",
    "type": "Person",
    "name": "my_action_name"
  },
  "object": {
    "type": "Note",
    "id": "1484625833669",
    "content": "Hello world"
  }
}
```

- A message received from Sally with Arguments

```json
{
  "@context": "https://www.w3.org/ns/activitystreams",
  "published": 1483677146,
  "type": "Create",
  "generator": {
    "id": "67c9cb10-8a74-42c8-ba55-294d0447cdf9",
    "type": "Service",
    "name": "google-assistant"
  },
  "actor": {
    "id": "IL12J7nWa/2zothSEg46DsY0q7o/H9FUis/YGdp64te=",
    "type": "Person"
  },
  "target": {
    "id": "my_action_name",
    "type": "Person",
    "name": "my_action_name"
  },
  "object": {
    "type": "Note",
    "id": "1484625833669",
    "content": "Hello world",
    "context": [
      {
        "content": "argValue",
        "name": "argName",
        "type": "Object"
      },
      {
        "content": "argValue1",
        "name": "argName1",
        "type": "Object"
      }
    ]
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
    "name": "google-assistant"
  },
  "object": {
    "type": "Note",
    "content": "hello world"
  },
  "to": {
    "id": "IL12J7nWa/2zothSEg46DsY0q7o/H9FUis/YGdp64te=",
    "type": "Person"
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

[node]: https://img.shields.io/node/v/broid-google-assistant.svg
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
