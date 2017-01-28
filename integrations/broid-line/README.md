# [Broid Line Parser](https://github.com/broidhq/feedhack) &middot; [![Build Status](https://travis-ci.org/broidHQ/broid-line.svg?branch=master)](https://travis-ci.org/broidHQ/broid-line) [![npm version](https://img.shields.io/npm/v/broid-line.svg?style=flat)](https://www.npmjs.com/package/broid-line) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/broidHQ/feedhack) [![CLA assistant](https://cla-assistant.io/readme/badge/broidhq/feedhack)](https://cla-assistant.io/broidhq/feedhack)

Broid _Integrations_ is an **open source project** providing a suite of [Activity Streams 2](https://www.w3.org/TR/activitystreams-core/) libraries for unified communications among a vast number of communication platforms.

**Feeback or features request are welcome. Go to https://github.com/broidhq/feedhack**

## Getting started

- `connect` and `listen` method return [a observable](http://reactivex.io/rxjs/).

- `send` method return [a promise](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/Promise)

### Connect to Line

```javascript
import broidLine from 'broid-line'

const line = new broidLine({
  token: "<channel_secret>",
  tokenSecret: "<channel_access_token>",
  username: "<channel_id>"
})

line.connect()
  .subscribe({
    next: data => console.log(data),
    error: err => console.error(`Something went wrong: ${err.message}`),
    complete: () => console.log('complete'),
  })
```

**Options availables**

| name             | Type     | default    | Description  |
| ---------------- |:--------:| :--------: | --------------------------|
| serviceID        | string   | random     | Arbitrary identifier of the running instance |
| logLevel         | string   | `info`     | Can be : `fatal`, `error`, `warn`, `info`, `debug`, `trace` |
| token            | string   |            | Your Channel Secret |
| tokenSecret      | string   |            | Your Channel Access Token |
| username         | string   |            | Your Channel ID |
| http             | object   | `{ "port": 8080, "http": "0.0.0.0" }` | WebServer options (`host`, `port`) |

### Good to know

- The Reply token can be found in object.context
- In One-one chat, the target object is fill with the actor informations.
- Image and Video buffer are not supported so the url will be fill with https://buffer_not_supported.broid.ai
- Because Line doesn't provide informations about the sender in Group, Context.
The actor is object is fill with fake informations.
- Line support only Image, Video https url

### Receive a message

```javascript
line.listen()
  .subscribe({
    next: data => console.log(`Received message: ${data}`),
    error: err => console.error(`Something went wrong: ${err.message}`),
    complete: () => console.log('complete'),
  })
```

## Buttons supported

| mediaType           | Action types  | Content of value property |
| ------------------- |:-------------:| --------------------------|
| text/html           | Action.URI      | URL to be opened in the built-in browser. |
|                     | Action.POSTBACK | Text of message which client will sent back as ordinary chat message. |

### Post a message

To send a message, the format should use the [broid-schemas](https://github.com/broidHQ/feedhack/tree/master/integrations/broid-schemas).

```javascript
const message_formated = '...'

line.send(message_formated)
  .then(() => console.log("ok"))
  .catch(err => console.error(err))
```

## Examples of messages

### Message received

- A message received from Sally

```json
{
  "@context": "https://www.w3.org/ns/activitystreams",
  "type": "Create",
  "published": 1482903365195,
  "generator": {
    "id": "f6e92eb6-f69e-4eae-8158-06613461cf3a",
    "type": "Service",
    "name": "line"
  },
  "actor": {
    "type": "Person",
    "name": "Sally",
    "id": "U1a2bb4a2fe413ea1c81ad6310c03d624"
  },
  "object": {
    "type": "Note",
    "content": "hello world",
    "id": "5415636082312",
    "context": {
      "type": "Object",
      "name": "Reply token",
      "content": "<reply_token>"
    }
  },
  "target": {
    "type": "Person",
    "name": "Sally",
    "id": "U1a2bb4a2fe413ea1c81ad6310c03d624"
  }
}
```

- A simple message received from a Group/Room

```json
{
  "@context": "https://www.w3.org/ns/activitystreams",
  "type": "Create",
  "published": 1482903365195,
  "generator": {
    "id": "f6e92eb6-f69e-4eae-8158-06613461cf3a",
    "type": "Service",
    "name": "line"
  },  
  "actor": {
    "type": "Person",
    "name": "Broid Ghost",
    "id": "broid_ghost"
  },
  "object": {
    "type": "Note",
    "content": "hello world",
    "id": "5415636082312",
    "context": {
      "type": "Object",
      "name": "Reply token",
      "content": "<reply_token>"
    }
  },
  "target": {
    "id": "U1a2bb4a2fe413ea1c81ad6310c03d624",
    "type": "Group"
  }
}
```

- A video/image received from Sally

```json
{
  "@context": "https://www.w3.org/ns/activitystreams",
  "type": "Create",
  "published": 1482903365195,
  "generator": {
    "id": "f6e92eb6-f69e-4eae-8158-06613461cf3a",
    "type": "Service",
    "name": "line"
  },  
  "actor": {
    "type": "Person",
    "name": "Sally",
    "id": "U1a2bb4a2fe413ea1c81ad6310c03d624"
  },
  "object": {
    "type": "Image",
    "url": "https://buffer_not_supported.broid.ai",
    "id": "5415636082312",
    "context": {
      "type": "Object",
      "name": "Reply token",
      "content": "<reply_token>"
    }
  },
  "target": {
    "type": "Person",
    "name": "Sally",
    "id": "U1a2bb4a2fe413ea1c81ad6310c03d624"
  }
}
```
- A Sally's location received

```json
{
  "@context": "https://www.w3.org/ns/activitystreams",
  "type": "Create",
  "published": 1482903365195,
  "generator": {
    "id": "f6e92eb6-f69e-4eae-8158-06613461cf3a",
    "type": "Service",
    "name": "line"
  },  
  "actor": {
    "type": "Person",
    "name": "Sally",
    "id": "U1a2bb4a2fe413ea1c81ad6310c03d624"
  },
  "object": {
    "type": "Place",
    "latitude": 36.75,
    "longitude": 119.7667,
    "content": "2350 Rue Ontario Est Montréal, QC H2K 1W1",
    "id": "549963611114",
    "context": {
      "type": "Object",
      "name": "Reply token",
      "content": "<reply_token>"
    }
  },
  "target": {
    "type": "Person",
    "name": "Sally",
    "id": "U1a2bb4a2fe413ea1c81ad6310c03d624"
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
    "name": "line"
  },
  "object": {
    "type": "Note",
    "content": "hello world",
    "context": {
      "type": "Object",
      "content": "<reply_token>"
    }    
  },
  "to": {
    "type": "Person",
    "id": "U1a2bb4a2fe413ea1c81ad6310c03d624"
  }
}
```

- Send a simple message directly to User, Group or Room

```json
{
  "@context": "https://www.w3.org/ns/activitystreams",
  "type": "Create",
  "generator": {
    "id": "f6e92eb6-f69e-4eae-8158-06613461cf3a",
    "type": "Service",
    "name": "line"
  },
  "object": {
    "type": "Note",
    "content": "hello world"
  },
  "to": {
    "type": "Person",
    "id": "U1a2ab6a2fe712ea1f81ad6310c03d624"
  }
}
```

- Send a Image, Video or Location

```json
{
  "@context": "https://www.w3.org/ns/activitystreams",
  "type": "Create",
  "generator": {
    "id": "f6e92eb6-f69e-4eae-8158-06613461cf3a",
    "type": "Service",
    "name": "line"
  },
  "object": {
    "type": "Image",
    "url": "https://unsplash.it/200/300"
  },
  "to": {
    "type": "Group",
    "id": "U1a2ab6a2fe712ea1f81ad6310c03d624"
  }
}
```

```json
{
  "@context": "https://www.w3.org/ns/activitystreams",
  "type": "Create",
  "generator": {
    "id": "f6e92eb6-f69e-4eae-8158-06613461cf3a",
    "type": "Service",
    "name": "line"
  },
  "object": {
    "type": "Place",
    "latitude": 36.75,
    "longitude": 119.7667,
    "content": "2350 Rue Ontario Est Montréal, QC H2K 1W1",
  },
  "to": {
    "type": "Group",
    "id": "U1a2ab6a2fe712ea1f81ad6310c03d624"
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
    "name": "line"
  },
  "object": {
    "type": "Note",
    "name": "Hello",
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
    "type": "Group",
    "id": "U1a2ab6a2fe712ea1f81ad6310c03d624"
  }
}
```

- Send a confirm message

```json
{
  "@context": "https://www.w3.org/ns/activitystreams",
  "type": "Create",
  "generator": {
    "id": "f6e92eb6-f69e-4eae-8158-06613461cf3a",
    "type": "Service",
    "name": "line"
  },
  "object": {
    "type": "Note",
    "name": "Hello",
    "content": "hello world",
    "attachment": [{
        "type": "Button",
        "content": "Wouldn't you prefer a good game of chess?",
        "name": "maze",
        "url": "value_maze",
        "attachment": {
          "name": "Falken's Maze",
          "content": "Wouldn't you prefer a good game of chess?",
          "yesLabel": "Yes",
          "noLabel": "No"
        }
    }]    
  },
  "to": {
    "type": "Group",
    "id": "U1a2ab6a2fe712ea1f81ad6310c03d624"
  }
}
```

- Send a caroussel

```json
{
  "@context": "https://www.w3.org/ns/activitystreams",
  "type": "Create",
  "generator": {
    "id": "f6e92eb6-f69e-4eae-8158-06613461cf3a",
    "type": "Service",
    "name": "line"
  },
  "object": {
    "type": "Collection",
    "items": [
      {
        "type": "Image",
        "name": "Product A",
        "content": "a cool product a",
        "url": "https://unsplash.it/200/300",
        "attachment": [{
            "type": "Button",
            "content": "Broid's website",
            "name": "broid",
            "mediaType": "text/html",
            "url": "https://www.broid.ai"
        }, {
            "type": "Button",
            "content": "Add to cart",
            "name": "Add to cart",
            "url": "action=buy&itemid=111"
        }]    
      },
      {
        "type": "Image",
        "name": "Product B",
        "content": "a cool product b",
        "url": "https://unsplash.it/g/200/300",
        "attachment": [{
            "type": "Button",
            "content": "Broid's website",
            "name": "broid",
            "mediaType": "text/html",
            "url": "https://www.broid.ai"
        }, {
            "type": "Button",
            "content": "Add to cart",
            "name": "Buy this product",
            "url": "action=buy&itemid=222"
        }]    
      }      
    ]
  },
  "to": {
    "type": "Person",
    "id": "U1a2ab6a2fe712ea1f81ad6310c03d624"
  }
}
```

**INFO** Keep the number of actions consistent for all columns. If you use an image or title for a column, make sure to do the same for all other columns.

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
