[npm]: https://img.shields.io/badge/npm-broid-green.svg?style=flat
[npm-url]: https://www.npmjs.com/org/broid

[node]: https://img.shields.io/node/v/@broid/slack.svg
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

# Broid Slack Integration

Broid Integrations is an open source project providing a suite of Activity Streams 2 libraries for unified communications among a vast number of communication platforms.

> Connect your App to Multiple Messaging Channels with  One OpenSource Language.

[![gitter](https://badges.gitter.im/broidHQ/broid.svg)](https://t.broid.ai/c/Blwjlw?utm_source=github&utm_medium=readme&utm_campaign=top&link=gitter)
[![slackin](https://slackin.broid.ai/badge.svg)](https://slackin.broid.ai)

## Message types supported

| Simple | Image | Video | Buttons | Location | Phone number |
|:------:|:-----:|:-----:|:-------:|:--------:|:------------:|
|   ✅    |   ✅   |   ✅   |    ✅    |          |              |

_Location, Phone number are platform limitations._

## Getting started

### Register your app/bot on Slack

- Instructions to create **bot**, can be found [here](https://api.slack.com/custom-integrations).

- Instructions to create **app**, can be found [here](https://api.slack.com/slack-apps).

_Notes:_ Interactive message are only supported on app (with Oauth bot token). Set Redirect URLs (in OAuth & Permissions) to http://127.0.0.1:8080, so you can catch the token.

You can generate one for test with this command: ``node bin/oauth.js --new -c client_id -s secret_id``

### Install

```bash
npm install --save @broid/slack
```

### Connect to Slack

```javascript
const BroidSlack = require('@broid/slack');

const slack = new BroidSlack({
  token: 'xxxxx',
  http: {
    host: '127.0.0.1',
    port: 8080
  }
});

slack.connect()
  .subscribe({
    next: data => console.log(data),
    error: err => console.error(`Something went wrong: ${err.message}`),
    complete: () => console.log('complete'),
  });
```

Slack can also be used with your existing express setup.

```javascript
const BroidSlack = require('@broid/slack');
const express = require("express");

const slack  = new BroidSlack({
  token: 'xxxxx'
});

const app = express();
app.use("/slack", slack.getRouter());

slack.connect()
  .subscribe({
    next: data => console.log(data),
    error: err => console.error(`Something went wrong: ${err.message}`),
    complete: () => console.log('complete'),
  });

app.listen(8080);
```

**Options available**

| name             | Type     | default    | Description  |
| ---------------- |:--------:| :--------: | --------------------------|
| serviceID       | string   | random     | Arbitrary identifier of the running instance |
| logLevel        | string   | `info`     | Can be : `fatal`, `error`, `warn`, `info`, `debug`, `trace` |
| token           | string   |            | Your access token |
| http             | object   |            | WebServer options (`host`, `port`) |


### Generate the "Bot User Token"

`broid-slack` needs the "Bot User Token" to authenticate against the Slack RTM and Web Client. To obtain this client, you can use the script at `bin/oauth.js`. You will need your "Client ID" and your "Client Secret":

```sh
$ ./oauth.js --new --clientID xxxxxxxxxxxxxxxxxxxxxxxxx --clientSecret yyyyyyyyyyyyyyyyyyyyyyyyyyyy
```

This will open your default web browser and guide you to obtain the needeed token (easily spotted starting with: `xoxp-`). Alternatively you can obtain a "Legacy Token" [here](https://api.slack.com/custom-integrations/legacy-tokens).

### Receive a message

```javascript
slack.listen()
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
    "name": "slack"
  },
  "object": {
    "type": "Note",
    "content": "hello world"
  },
  "to": {
    "type": "Person",
    "id": "C1E3X0RRB"
  }
};

slack.send(formatted_message)
  .then(() => console.log("ok"))
  .catch(err => console.error(err));
```

## Buttons supported

This adapter support the [interactive messages](https://api.slack.com/docs/message-buttons)

## Examples of messages

You can find examples of sent and received messages at [Broid-Schemas](https://github.com/broidHQ/integrations/tree/master/broid-schemas).

## Contributing to Broid

See [CONTRIBUTE.md](../CONTRIBUTE.md)

## Copyright & License

Copyright (c) 2016-2017 Broid.ai

This project is licensed under the AGPL 3, which can be
[found here](https://www.gnu.org/licenses/agpl-3.0.en.html).
