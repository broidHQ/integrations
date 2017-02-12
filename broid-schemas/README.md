[![Build Status](https://travis-ci.org/broidHQ/integrations.svg?branch=master)](https://travis-ci.org/broidHQ/integrations) [![npm version](https://img.shields.io/npm/v/broid-schemas.svg?style=flat)](https://www.npmjs.com/package/broid-schemas) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/broidHQ/integrations)

# Broid Schemas

Broid Integrations is an open source project providing a suite of Activity Streams 2 libraries for unified communications among a vast number of communication platforms.

> Connect your App to Multiple Messaging Channels with  One OpenSource Language.

## Schemas

Broid integrations support Simple, Rich, Video and Image messages.
As  possible, theses schemas use [activitystreams 2.0](https://www.w3.org/TR/activitystreams-core/)  specifications.

### Examples

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

In this case, `generator` field is use to inform that messaging plateform is `Slack` and the `target` field contain information about the Channel (_Group_ or _Person_). `actor` is the author of the message.


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

# Contributing to Broid

Broid is an open source project. Broid wouldn't be where it is now without contributions by the community. Please consider forking Broid to improve, enhance or fix issues. If you feel like the community will benefit from your fork, please open a pull request.

And because we want to do the better for you. Help us improving Broid by
sharing your feedback on our [Feedback GitHub Repo](https://github.com/broidhq/integrations) and let's build Broid together!

## Code of Conduct

Make sure that you're read and understand the [Code of Conduct](http://contributor-covenant.org/version/1/2/0/).

## CLA

To protect the interests of the Broid contributors, Broid, customers and end users we require contributors to sign a [Contributors License Agreement](https://cla-assistant.io/broidhq/integrations) (CLA) before we pull the changes into the main repository. [Our CLA](https://cla-assistant.io/broidhq/integrations) is simple and straightforward - it requires that the contributions you make to any Broid open source project are properly licensed and that you have the legal authority to make those changes. This helps us significantly reduce future legal risk for everyone involved. It's easy---no faxing or printing required!

You can digitally sign the [CLA online](https://cla-assistant.io/broidhq/integrations). Please indicate your email address in your first pull request so that we can make sure that will locate your CLA. Once you've submitted it, you no longer need to send one for subsequent submissions.

## Copyright & License

Copyright (c) 2016-2017 Broid.ai

This project is licensed under the AGPL 3, which can be
[found here](https://www.gnu.org/licenses/agpl-3.0.en.html).
