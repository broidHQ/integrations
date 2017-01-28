# [Broid Skype Parser](https://github.com/broidhq/feedhack) &middot; [![Build Status](https://travis-ci.org/broidHQ/broid-skype.svg?branch=master)](https://travis-ci.org/broidHQ/broid-skype) [![npm version](https://img.shields.io/npm/v/broid-skype.svg?style=flat)](https://www.npmjs.com/package/broid-skype) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/broidHQ/feedhack) [![CLA assistant](https://cla-assistant.io/readme/badge/broidhq/feedhack)](https://cla-assistant.io/broidhq/feedhack)

Broid _Integrations_ is an **open source project** providing a suite of [Activity Streams 2](https://www.w3.org/TR/activitystreams-core/) libraries for unified communications among a vast number of communication platforms.

**Feeback or features request are welcome. Go to https://github.com/broidhq/feedhack**

## Getting started

- `connect` and `listen` method return [a observable](http://reactivex.io/rxjs/).

- `send` method return [a promise](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/Promise)

### Connect to Skype

```javascript
import broidSkype from 'broid-skype'

const skype = new broidSkype({
  token: 'xxxxx',
  token_secret: 'xxxxxx',
})

skype.connect()
  .subscribe({
    next: data => console.log(data),
    error: err => console.error(`Something went wrong: ${err.message}`),
    complete: () => console.log('complete'),
  })
```

**Options availables**

| name             | Type     | default    | Description  |
| ---------------- |:--------:| :--------: | --------------------------|
| token            | string   |      |  |
| token_secret     | string   |      |  |
| service_id       | string   | random     | Arbitrary identifier of the running instance |
| log_level        | string   | `debug`    | Can be : `fatal`, `error`, `warn`, `info`, `debug`, `trace` |
| http             | object   | `{ "port": 8080, "http": "0.0.0.0" }` | HTTP options (`host`, `port`) |


### Receive a message

```javascript
skype.listen()
  .subscribe({
    next: data => console.log(`Received message: ${data}`),
    error: err => console.error(`Something went wrong: ${err.message}`),
    complete: () => console.log('complete'),
  })
```

## Buttons supported

| mediaType        | Action types  | Content of value property  |
| ---------------- |:-------------:| --------------------------|
| text/html        | open-url      | URL to be opened in the built-in browser. |
| audio/telephone-event | call     | Destination for a call in following format: "tel:123123123123". |
|                       | imBack   | Text of message which client will sent back as ordinary chat message. |

### Post a message

To send a message, the format should use the [broid-schemas](https://github.com/broidHQ/feedhack/tree/master/integrations/broid-schemas).

```javascript
const message_formated = '...'

skype.send(message_formated)
  .then(() => console.log("ok"))
  .catch(err => console.error(err))
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
