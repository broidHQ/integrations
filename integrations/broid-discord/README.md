# [Broid Discord Parser](https://github.com/broidhq/feedhack) &middot; [![Build Status](https://travis-ci.org/broidHQ/broid-discord.svg?branch=master)](https://travis-ci.org/broidHQ/broid-discord) [![npm version](https://img.shields.io/npm/v/broid-discord.svg?style=flat)](https://www.npmjs.com/package/broid-discord) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/broidHQ/feedhack) [![CLA assistant](https://cla-assistant.io/readme/badge/broidhq/feedhack)](https://cla-assistant.io/broidhq/feedhack)

Broid _Integrations_ is an **open source project** providing a suite of [Activity Streams 2](https://www.w3.org/TR/activitystreams-core/) libraries for unified communications among a vast number of communication platforms.

**Feeback or features request are welcome. Go to https://github.com/broidhq/feedhack**

## Getting started

- `connect` and `listen` method return [a observable](http://reactivex.io/rxjs/).

- `send` method return [a promise](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/Promise)

### Register your app/bot on Discord

- Instructions to create **bot**, can be found [here](https://discordapp.com/developers/docs/intro).

### Connect to Discord

```javascript
import broidDiscord from 'broid-discord'

const discord = new broidDiscord({ token: "xoxp-xxxxxx" })

discord.connect()
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
| token            | string   |            | Your bot access token |

### Receive a message

```javascript
discord.listen()
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

discord.send(message_formated)
  .then(() => console.log("ok"))
  .catch(err => console.error(err))
```

## Examples of messages

### Message received

- A direct message received from Sally

```json
{
  "@context": "https://www.w3.org/ns/activitystreams",
  "published": 1483491501,
  "type": "Create",
  "generator": {
    "id": "af869e0f-f4e5-424d-a288-1657d843f438",
    "type": "Service",
    "name": "discord"
  },
  "object": {
    "type": "Note",
    "id": "1483491501",
    "content": "hello world on private"
  },
  "target": {
    "type": "Person",
    "id": "152483118161461248"
  },
  "actor": {
    "id": "152486124831181614",
    "type": "Person",
    "name": "sally"
  }
}
```

- A message received from Sally on Channel/Group

```json
{
  "@context": "https://www.w3.org/ns/activitystreams",
  "published": 1483491501,
  "type": "Create",
  "generator": {
    "id": "af869e0f-f4e5-424d-a288-1657d843f438",
    "type": "Service",
    "name": "discord"
  },
  "object": {
    "type": "Note",
    "id": "1483491501",
    "content": "hello world on private"
  },
  "target": {
    "type": "Group",
    "id": "152483118161461248",
    "name": "channelname"
  },
  "actor": {
    "id": "152486124831181614",
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
    "name": "discord"
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

- Edit a message

```json
{
  "@context": "https://www.w3.org/ns/activitystreams",
  "type": "Update",
  "generator": {
    "id": "f6e92eb6-f69e-4eae-8158-06613461cf3a",
    "type": "Service",
    "name": "discord"
  },
  "object": {
    "type": "Note",
    "content": "hello world edited",
    "id": "1483406119",
  },
  "to": {
    "type": "Person",
    "id": "152486124831181614"
  }
}
```

- Delete a message

```json
{
  "@context": "https://www.w3.org/ns/activitystreams",
  "type": "Delete",
  "generator": {
    "id": "f6e92eb6-f69e-4eae-8158-06613461cf3a",
    "type": "Service",
    "name": "discord"
  },
  "object": {
    "type": "Note",
    "content": "",
    "id": "1483406119",
  },
  "to": {
    "type": "Person",
    "id": "152486124831181614"
  }
}
```

- Send a image or a video

```json
{
  "@context": "https://www.w3.org/ns/activitystreams",
  "type": "Create",
  "generator": {
    "id": "f6e92eb6-f69e-4eae-8158-06613461cf3a",
    "type": "Service",
    "name": "discord"
  },
  "object": {
    "content": "image.jpg",
    "type": "Image",
    "url": "https://www.broid.ai/url_of_image.jpg",
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

To protect the interests of the Broid contributors, Broid, customers and end users we require contributors to sign a [Contributors License Agreement](https://cla-assistant.io/readme/badge/broidhq/feedhack) (CLA) before we pull the changes into the main repository. [Our CLA](https://cla-assistant.io/readme/badge/broidhq/feedhack) is simple and straightforward - it requires that the contributions you make to any Broid open source project are properly licensed and that you have the legal authority to make those changes. This helps us significantly reduce future legal risk for everyone involved. It's easy---no faxing or printing required!

You can digitally sign the [CLA online](https://cla-assistant.io/readme/badge/broidhq/feedhack). Please indicate your email address in your first pull request so that we can make sure that will locate your CLA. Once you've submitted it, you no longer need to send one for subsequent submissions.

## Copyright & License

Copyright (c) 2016-2017 Broid.ai

This project is licensed under the AGPL 3, which can be
[found here](https://www.gnu.org/licenses/agpl-3.0.en.html).
