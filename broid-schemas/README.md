[![Build Status](https://travis-ci.org/broidHQ/integrations.svg?branch=master)](https://travis-ci.org/broidHQ/integrations) [![npm version](https://img.shields.io/npm/v/@broid/schemas.svg?style=flat)](https://www.npmjs.com/package/@broid/schemas) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/broidHQ/integrations)

# Broid Schemas

Broid Integrations is an open source project providing a suite of Activity Streams 2 libraries for unified communications among a vast number of communication platforms.

> Connect your App to Multiple Messaging Channels with  One OpenSource Language.

## Schemas

Broid integrations support Simple, Rich, Video and Image messages.
Theses schemas use [activitystreams 2.0](https://www.w3.org/TR/activitystreams-core/) specifications. If using Typescript, you can use the interfaces supplied [here](https://github.com/broidHQ/integrations/blob/master/broid-schemas/src/index.ts) to simplify your work.

### Examples

Here you'll find examples of communication across different services. Even though the examples may not be to the service
you wish to use, the schema remains the same across all integrations if the communication method (e.g images, videos) is
supported.

- A simple message received on Slack from Sally:

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
    "name": "slack",
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

In this case, `generator` field is use to inform that messaging platform is `Slack` and the `target` field contain information about the Channel (_Group_ or _Person_). `actor` is the author of the message.

- A message received from Sally with arguments on Google Assistant

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

- A video/image received on Callr.

```json
{
  "@context": "https://www.w3.org/ns/activitystreams",
  "published": 1483677146,
  "type": "Create",
  "generator": {
    "id": "67c9cb10-8a74-42c8-ba55-294d0447cdf9",
    "type": "Service",
    "name": "callr"
  },
  "actor": {
    "id": "+15437783737",
    "type": "Person",
    "name": "+15437783737"
  },
  "target": {
    "id": "+15437783700",
    "type": "Person",
    "name": "+15437783700"
  },
  "object": {
  "type": "Image",
  "id": "358c14836772801482I5g3Jjko7RWp6M",
  "url": "http://images.nationalgeographic.com/wpf/media-live/photos/000/090/cache/african-elephant-standing_9033_600x450.jpg",
  "mediaType": "image/jpeg"
  }
}
```

- A location received from Sally on Groupme

```json
{
  "@context": "https://www.w3.org/ns/activitystreams",
  "generator": {
    "id": "67c9cb10-8a74-42c8-ba55-294d0447cdf9",
    "type": "Service",
    "name": "groupme"
  },
  "published": 1483589416,
  "type": "Create",
  "actor": {
    "id": "43963839",
    "name": "Sally Doe",
    "type": "Person"
  },
  "target": {
    "id": "28728284",
    "name": "dev",
    "type": "Person"
  },
  "object": {
    "id": "148652394682185354",
    "latitude": 45.531106,
    "longitude": -73.554582,
    "name": "Café Touski",
    "type": "Place"
  }
}
```

- A quick reply send to Messenger:

```json
{
  "@context": "https://www.w3.org/ns/activitystreams",
  "type": "Create",
  "generator": {
    "id": "f6e92eb6-f69e-4eae-8158-06613461cf3a",
    "type": "Service",
    "name": "messenger"
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

- Edit a message on Discord

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

- Delete a message on Discord

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

- Send a image on Kik

```json
{
  "@context": "https://www.w3.org/ns/activitystreams",
  "type": "Create",
  "generator": {
    "id": "f6e92eb6-f69e-4eae-8158-06613461cf3a",
    "type": "Service",
    "name": "kik"
  },
  "object": {
    "type": "Image",
    "content": "hello world",
    "url": "https://www.broid.ai/images/fake.png",
    "preview": "https://www.broid.ai/images/fake.png"
  },
  "to": {
    "type": "Person",
    "id": "sally2"
  }
}
```

- Send a video on Kik

```json
{
  "@context": "https://www.w3.org/ns/activitystreams",
  "type": "Create",
  "generator": {
    "id": "f6e92eb6-f69e-4eae-8158-06613461cf3a",
    "type": "Service",
    "name": "kik"
  },
  "object": {
    "type": "Video",
    "content": "hello world",
    "url": "https://www.broid.ai/videos/echo-hereweare.mp4",
    "preview": "https://www.broid.ai/images/fake.png"
  },
  "to": {
    "type": "Person",
    "id": "sally2"
  }
}
```

- Send a audio clip on WeChat

```json
{
  "@context": "https://www.w3.org/ns/activitystreams",
  "type": "Create",
  "generator": {
    "id": "f6e92eb6-f69e-4eae-8158-06613461cf3a",
    "type": "Service",
    "name": "wechat"
  },
  "object": {
    "type": "Audio",
    "content": "hello world",
    "url": "https://www.broid.ai/audio/audio.amr"
  },
  "to": {
    "type": "Person",
    "id": "wechat_user_openid"
  }
}
```

- Send a confirm message on Kik

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

- Send a caroussel on Kik

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

- Send a location on Viber

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

- A interactive message callback on Slack

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

- Respond to interactive message on Slack

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

**INFO** Keep the number of actions consistent for all columns. If you use an image or title for a column, make sure to do the same for all other columns.

## Contributing to Broid

See [CONTRIBUTE.md](../CONTRIBUTE.md)

## Copyright & License

Copyright (c) 2016-2017 Broid.ai

This project is licensed under the AGPL 3, which can be
[found here](https://www.gnu.org/licenses/agpl-3.0.en.html).
