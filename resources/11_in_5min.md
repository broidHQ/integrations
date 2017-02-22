# Integrate 11 messaging platforms in 5 minutes.

The task of making your bot or application available on 11 different platforms can be long and tedious. Broid allows you to do this very quickly.

First step is you have to sign in on all the platforms:

- Discord
- Messenger
- Slack
- Twitter

## Create an nodejS project

```bash
$ mkdir mynewapp
$ cd mynewapp && npm init
```

## Add the libraries

```bash
$ npm i --save broid-twitter \
broid-slack \
broid-twitter \
broid-viber \
broid-line \
broid-kik \
broid-callr \
broid-twilio \
broid-skype \
broid-discord \
broid-messenger \
broid-telegram \
rxjs \
ramda
```

## Connect your application

Each broid integration provides you an observable, the first part of the code can look like:

```js
const Rx = require("rxjs/Rx");
const R = require("ramda");

const broidCallr = require("broid-callr");
const broidDiscord = require("broid-discord");
const broidLine = require("broid-line");
const broidKik = require("broid-kik");
const broidMessenger = require("broid-messenger");
const broidSkype = require("broid-skype");
const broidSlack = require("broid-slack");
const broidTelegram = require("broid-telegram");
const broidTwilio = require("broid-twilio");
const broidTwitter = require("broid-twitter");
const broidViber = require("broid-viber");

const clients = {
  callr: new broidCallr({}),
  discord: new broidDiscord({}),
  line: new broidLine({}),
  kik: new broidKik({}),
  messenger: new broidMessenger({}),
  skype: new broidSkype({}),
  slack: new broidSlack({}),
  telegram: new broidTelegram({})
  twitter: new broidTwitter({}),
  twilio: new broidTwilio({}),
  viber: new broidViber({}),
};

Rx.Observable.merge(...R.map(client => client.connect(), R.values(clients)))
.subscribe({
  next: data => console.log(JSON.stringify(data, null, 2)),
  error: err => console.error(`Something went wrong: ${err.message}`),
});
```

Now our application can connect to all 11 messaging platforms.

## Listen to incoming messages

Really simple:

```js
Rx.Observable.merge(...R.map(client => client.listen(), R.values(clients)))
.subscribe({
  next: message => console.log(JSON.stringify(message, null, 2)),
  error: err => console.error(`Something went wrong: ${err.message}`),
});

```

At this point, our application can receive all messages coming from theses 11 platforms.

## Respond to an hello world message

Next we can handle a greeting in our application by responding only to a "hello world" message.

```js
Rx.Observable.merge(...R.map(client => client.listen(), R.values(clients)))
.subscribe({
  next: message => {
    if (message.type === "Create") {
      const to = R.path(["target", "id"], data);
      const to_type = R.path(["target", "type"], data);
      const content = R.path(["object", "content"], data);
      const service_id = R.path(["generator", "id"], data);
      const service_name = R.path(["generator", "name"], data);
      const type = R.path(["object", "type"], data);

      if (type === "Note" && content.toLowerCase() === "hello world") {
        const message = {
          "@context": "https://www.w3.org/ns/activitystreams",
          "type": "Create",
          "generator": {
            "id": service_id,
            "type": "Service",
            "name": service_name
          },
          "object": {
            "type": "Note",
            "content": "Hello, how are you?"
          },
          "to": {
            "type": to_type,
            "id": to
          }
        };

        clients[service_name].send(message)
          .then(console.log)
          .catch(console.error);
      }

    }
  },
  error: err => console.error(`Something went wrong: ${err.message}`),
});
```

Easy?

You find the code of this tutorial [here](https://github.com/broidHQ/11platforms/blob/master/index.js)
