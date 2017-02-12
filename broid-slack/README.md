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

## Message types supported

| Simple   | Image    | Video  | Buttons  | Location  | Phone number |
|:--------:|:--------:|:------:|:--------:|:---------:|:------------:|
| ✅       | ✅      | ✅     | ✅        |        |              |

_Location, Phone number are platform limitations._

## Getting started

### Register your app/bot on Slack

- Instructions to create **bot**, can be found [here](https://api.slack.com/custom-integrations).

- Instructions to create **app**, can be found [here](https://api.slack.com/slack-apps).

_Notes:_ Interactive message are only supported on app (with Oauth bot token).

You can generate one for test with this command: ``node bin/oauth.js --new -c client_id -s secret_id``

### Connect to Slack

```javascript
import broidSlack from 'broid-slack'

const slack = new broidSlack({
  token: 'xxxxx'
})

slack.connect()
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

### Receive a message

```javascript
slack.listen()
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

slack.send(message_formated)
  .then(() => console.log("ok"))
  .catch(err => console.error(err))
```

## Buttons supported

This adapter support the [interactive messages](https://api.slack.com/docs/message-buttons)

## Examples of messages

### Message received

- A direct message received from Sally

```json
{
  "@context": "https://www.w3.org/ns/activitystreams",
  "generator": {
    "id": "58a48f11-d623-475a-9335-80f9466ea08b",
    "name": "slack",
    "type": "Service"
  },
  "published": 1483872057,
  "type": "Create",
  "actor": {
    "id": "U0K81Q8N3",
    "name": "Sally",
    "type": "Person"
  },
  "target": {
    "id": "D3LGCDRM1",
    "name": "D3LGCDRM1",
    "type": "Person"
  },
  "object": {
    "content": "hello world",
    "id": "1483872057.000018",
    "type": "Note"
  }
}
```

- A message received from Sally on Channel/Group

```json
{
  "@context": "https://www.w3.org/ns/activitystreams",
  "generator": {
    "id": "58a48f11-d623-475a-9335-80f9466ea08b",
    "name": "slack",
    "type": "Service"
  },
  "published": 1483872034,
  "type": "Create",
  "actor": {
    "id": "U0K81Q8N3",
    "name": "Sally",
    "type": "Person"
  },
  "target": {
    "id": "G3LT1PUN2",
    "name": "G3LT1PUN2",
    "type": "Group"
  },
  "object": {
    "content": "hello world on group",
    "id": "1483872034.000005",
    "type": "Note"
  }
}

```

- A interactive message callback

```json
{
  "@context": "https://www.w3.org/ns/activitystreams",
  "published": 1483495367,
  "type": "Create",
  "generator": {
    "id": "a99f63b0-aa77-40b4-8cf5-4ae3d694ed94",
    "type": "Service",
    "name": "slack"
  },
  "object": {
    "type": "Note",
    "id": "1483495367.753793",
    "content": "https://www.broid.ai",
    "context": {
      "type": "Object",
      "name": "interactive_message_callback",
      "content": "03722c50-14d6-4501-a7d7-18c833079a49#https://hooks.slack.com/actions/xxxx/xxxxx"
    }
  },
  "target": {
    "type": "Group",
    "id": "C1L7YRBLG",
    "name": "channelname"
  },
  "actor": {
    "id": "U0K81Q8N3",
    "type": "Person",
    "name": "sally"
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
}
```

- Edit a message

```json
{
  "@context": "https://www.w3.org/ns/activitystreams",
  "type": "Create",
  "generator": {
    "id": "f6e92eb6-f69e-4eae-8158-06613461cf3a",
    "type": "Service",
    "name": "slack"
  },
  "object": {
    "type": "Note",
    "content": "hello world edited",
    "id": "1483406119.000020",
  },
  "to": {
    "type": "Person",
    "id": "C1E3X0RRB"
  }
}
```

- Delete a message

```json
{
  "@context": "https://www.w3.org/ns/activitystreams",
  "type": "Create",
  "generator": {
    "id": "f6e92eb6-f69e-4eae-8158-06613461cf3a",
    "type": "Service",
    "name": "slack"
  },
  "object": {
    "type": "Note",
    "content": "",
    "id": "1483406119.000020",
  },
  "to": {
    "type": "Person",
    "id": "C1E3X0RRB"
  }
}
```

- Send a Image

```json
{
  "@context": "https://www.w3.org/ns/activitystreams",
  "type": "Create",
  "generator": {
    "id": "f6e92eb6-f69e-4eae-8158-06613461cf3a",
    "type": "Service",
    "name": "slack"
  },
  "object": {
    "type": "Image",
    "content": "this is a image!",
    "url": "http://url_of/images/image.png"
  },
  "to": {
    "type": "Group",
    "id": "C1L7YRBLG"
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
    "name": "slack"
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
        "content": "Falken's Maze Confirm",
        "name": "maze",
        "url": "value_maze",
        "attachment": {
          "name": "Falken's Maze",
          "content": "Can you confirm?",
          "yesLabel": "Yes",
          "noLabel": "No"
        }
    }]
  },
  "to": {
    "type": "Group",
    "id": "C1L7YRBLG"
  }
}
```

- Respond to interactive message

```json
{
  "@context": "https://www.w3.org/ns/activitystreams",
  "type": "Create",
  "generator": {
    "id": "f6e92eb6-f69e-4eae-8158-06613461cf3a",
    "type": "Service",
    "name": "slack"
  },
  "object": {
    "type": "Note",
    "content": "go for http://broid.ai",
    "context" : {
      "type": "Object",
      "name": "interactive_message_callback",
      "content": "03722c50-14d6-4501-a7d7-18c833079a49#https://hooks.slack.com/actions/xxxx/xxxxx"
    },    
  },
  "to": {
    "type": "Group",
    "id": "C1L7YRBLG"
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

[node]: https://img.shields.io/node/v/broid-slack.svg
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
