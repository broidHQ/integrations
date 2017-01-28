# [Broid Slack Parser](https://github.com/broidhq/feedhack) &middot; [![Build Status](https://travis-ci.org/broidHQ/broid-slack.svg?branch=master)](https://travis-ci.org/broidHQ/broid-slack) [![npm version](https://img.shields.io/npm/v/broid-slack.svg?style=flat)](https://www.npmjs.com/package/broid-slack) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/broidHQ/feedhack) [![CLA assistant](https://cla-assistant.io/readme/badge/broidhq/feedhack)](https://cla-assistant.io/broidhq/feedhack)

Broid _Integrations_ is an **open source project** providing a suite of [Activity Streams 2](https://www.w3.org/TR/activitystreams-core/) libraries for unified communications among a vast number of communication platforms.

**Feeback or features request are welcome. Go to https://github.com/broidhq/feedhack**

## Getting started

- `connect` and `listen` method return [a observable](http://reactivex.io/rxjs/).

- `send` method return [a promise](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/Promise)

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

To send a message, the format should use the [broid-schemas](https://github.com/broidHQ/feedhack/tree/master/integrations/broid-schemas).

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
