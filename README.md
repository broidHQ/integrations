[![npm][npm]][npm-url]
[![node][node]][node-url]
[![deps][deps]][deps-url]
[![tests][tests]][tests-url]
[![bithound][bithound]][bithound-url]
[![bithoundscore][bithoundscore]][bithoundscore-url]
[![nsp-checked][nsp-checked]][nsp-checked-url]

# Broid

Broid Integrations is an open source project providing a suite of Activity Streams 2 libraries for unified communications among a vast number of communication platforms.

> Connect your App to Multiple Messaging Channels with  One OpenSource Language.

<br>
<a href="https://github.com/broidHQ/integrations">
<img alt="Broid.ai" src="https://t.broid.ai/i/b-github-cover?utm_source=github&utm_medium=readme&utm_campaign=cover#a">
</a>
<br>
<br>
[![gitter](https://badges.gitter.im/broidHQ/broid.svg)](https://t.broid.ai/c/Blwjlw?utm_source=github&utm_medium=readme&utm_campaign=top&link=gitter)


## Install

```bash
npm install --save broid-<your-messaging-plateform>
```

## Introduction

Broid Integrations provide a suite of librairies to convert all messagings plateforms events to [Activity Streams 2](https://t.broid.ai/c/LSB12U?utm_source=github&utm_medium=readme&utm_campaign=introduction&link=as2) schemas.

**TL;DR**

* All events are Observables (RxJS)
* All functions return Promise (Bluebird)
* Highly modular and low level to keep your focus on hight level features.

### Get Started

Check out Broid's quick [**Get Started**](https://t.broid.ai/c/MRAxh0?utm_source=github&utm_medium=readme&utm_campaign=get-started) guide.

<a name="integrations"></a>
## Integrations

Broid Integrations support simple, media and rich messages (location, carroussel) and split into multiple librairies.
This make Broid **flexible** and **usefull** to use in your application.

#### Node packages

||Name|Status|
|:--|:--|:----|
|<a href="https://github.com/broidHQ/integrations/tree/master/integrations/broid-slack"><img width="35" src="https://t.broid.ai/i/s-slack-color?utm_source=github&utm_medium=readme&utm_campaign=integrations"></a>| broid-slack |[![viber][slack-npm]][slack-url] [![slack][slack-dm]][slack-dm-url] [![slack][integration-doc]][slack-url]|
|<a href="https://github.com/broidHQ/integrations/tree/master/integrations/broid-viber"><img width="35" src="https://t.broid.ai/i/p-viber-color?utm_source=github&utm_medium=readme&utm_campaign=integrations"></a>| broid-viber |[![viber][viber-npm]][viber-url] [![viber][viber-dm]][viber-dm-url] [![viber][integration-doc]][viber-url]|
|<a href="https://github.com/broidHQ/integrations/tree/master/integrations/broid-twitter"><img width="35" src="https://t.broid.ai/i/s-twitter-color?utm_source=github&utm_medium=readme&utm_campaign=integrations"></a>| broid-twitter |[![viber][twitter-npm]][twitter-url] [![twitter][twitter-dm]][twitter-dm-url] [![twitter][integration-doc]][twitter-url]|
|<a href="https://github.com/broidHQ/integrations/tree/master/integrations/broid-line"><img width="35" src="https://t.broid.ai/i/p-line-color?utm_source=github&utm_medium=readme&utm_campaign=integrations"></a>| broid-line |[![line][line-npm]][line-url] [![line][line-dm]][line-dm-url] [![line][integration-doc]][line-url]|
|<a href="https://github.com/broidHQ/integrations/tree/master/integrations/broid-messenger"><img width="35" src="https://t.broid.ai/i/s-messenger-color?utm_source=github&utm_medium=readme&utm_campaign=integrations"></a>| broid-messenger |[![messenger][messenger-npm]][messenger-url] [![messenger][messenger-dm]][messenger-dm-url] [![messenger][integration-doc]][messenger-url]|
|<a href="https://github.com/broidHQ/integrations/tree/master/integrations/broid-callr"><img width="35" src="https://t.broid.ai/i/p-callr-color?utm_source=github&utm_medium=readme&utm_campaign=integrations"></a>| broid-callr |[![callr][callr-npm]][callr-url] [![callr][callr-dm]][callr-dm-url] [![callr][integration-doc]][callr-url]|
|<a href="https://github.com/broidHQ/integrations/tree/master/integrations/broid-discord"><img width="35" src="https://t.broid.ai/i/s-discord-color?utm_source=github&utm_medium=readme&utm_campaign=integrations"></a>| broid-discord |[![discord][discord-npm]][discord-url] [![discord][discord-dm]][discord-dm-url] [![discord][integration-doc]][discord-url]|
|<a href="https://github.com/broidHQ/integrations/tree/master/integrations/broid-skype"><img width="35" src="https://t.broid.ai/i/p-skype-color?utm_source=github&utm_medium=readme&utm_campaign=integrations"></a>| broid-skype |[![skype][skype-npm]][skype-url] [![skype][skype-dm]][skype-dm-url] [![skype][integration-doc]][skype-url]|
|<a href="https://github.com/broidHQ/integrations/tree/master/integrations/broid-telegram"><img width="35" src="https://t.broid.ai/i/s-telegram-color?utm_source=github&utm_medium=readme&utm_campaign=integrations"></a>| broid-telegram |[![telegram][telegram-npm]][telegram-url] [![telegram][telegram-dm]][telegram-dm-url] [![telegram][integration-doc]][telegram-url]|
|<a href="https://github.com/broidHQ/integrations/tree/master/integrations/broid-twilio"><img width="35" src="https://t.broid.ai/i/p-twilio-color?utm_source=github&utm_medium=readme&utm_campaign=integrations"></a>| broid-twilio |[![twilio][twilio-npm]][twilio-url] [![twilio][twilio-dm]][twilio-dm-url] [![twilio][integration-doc]][twilio-url]|
|<a href="https://github.com/broidHQ/integrations/tree/master/integrations/broid-flowdock"><img width="35" src="https://t.broid.ai/i/s-flowdock-color?utm_source=github&utm_medium=readme&utm_campaign=integrations"></a>| broid-flowdock |[![flowdock][flowdock-npm]][flowdock-url] [![flowdock][flowdock-dm]][flowdock-dm-url] [![flowdock][integration-doc]][flowdock-url]|
|<a href="https://github.com/broidHQ/integrations/tree/master/integrations/broid-kik"><img width="35" src="https://t.broid.ai/i/p-kik-color?utm_source=github&utm_medium=readme&utm_campaign=integrations"></a>| broid-kik |[![kik][kik-npm]][kik-url] [![kik][kik-dm]][kik-dm-url] [![kik][integration-doc]][kik-url]|
|<a href="https://github.com/broidHQ/integrations/tree/master/integrations/broid-irc"><img width="35" src="https://t.broid.ai/i/p-irc-color?utm_source=github&utm_medium=readme&utm_campaign=integrations"></a>| broid-irc |[![irc][irc-npm]][irc-url] [![irc][irc-dm]][irc-dm-url] [![irc][integration-doc]][irc-url]|
|<a href="https://github.com/broidHQ/integrations/tree/master/integrations/broid-google-assistant"><img width="35" src="https://t.broid.ai/i/p-google-assistant-color?utm_source=github&utm_medium=readme&utm_campaign=integrations"></a>| broid-google-assistant |[![google-assistant][google-assistant-npm]][google-assistant-url] [![google-assistant][google-assistant-dm]][google-assistant-dm-url] [![google-assistant][integration-doc]][google-assistant-url]|
|<a href="https://github.com/broidHQ/integrations/tree/master/integrations/broid-gitter"><img width="35" src="https://t.broid.ai/i/p-gitter-color?utm_source=github&utm_medium=readme&utm_campaign=integrations"></a>| broid-gitter |[![gitter][gitter-npm]][gitter-url] [![gitter][gitter-dm]][gitter-dm-url] [![gitter][integration-doc]][gitter-url]|
|<a href="https://github.com/broidHQ/integrations/tree/master/integrations/broid-nexmo"><img width="35" src="https://t.broid.ai/i/p-nexmo-color?utm_source=github&utm_medium=readme&utm_campaign=integrations"></a>| broid-nexmo |[![nexmo][nexmo-npm]][nexmo-url] [![nexmo][nexmo-dm]][nexmo-dm-url] [![nexmo][integration-doc]][nexmo-url]|

[integration-doc]: https://img.shields.io/badge/docs--green.svg?style=flat

[slack-url]: https://github.com/broidHQ/integrations/tree/master/integrations/broid-slack
[slack-dm]: https://david-dm.org/broidhq/integrations.svg?path=integrations/broid-slack
[slack-dm-url]: https://david-dm.org/broidhq/integrations?path=integrations/broid-slack
[slack-npm]: https://img.shields.io/npm/v/broid-slack.svg

[twitter-url]: https://github.com/broidHQ/integrations/tree/master/integrations/broid-twitter
[twitter-dm]: https://david-dm.org/broidhq/integrations.svg?path=integrations/broid-twitter
[twitter-dm-url]: https://david-dm.org/broidhq/integrations?path=integrations/broid-twitter
[twitter-npm]: https://img.shields.io/npm/v/broid-twitter.svg

[viber-url]: https://github.com/broidHQ/integrations/tree/master/integrations/broid-viber
[viber-dm]: https://david-dm.org/broidhq/integrations.svg?path=integrations/broid-viber
[viber-dm-url]: https://david-dm.org/broidhq/integrations?path=integrations/broid-viber
[viber-npm]: https://img.shields.io/npm/v/broid-viber.svg

[line-url]: https://github.com/broidHQ/integrations/tree/master/integrations/broid-line
[line-dm]: https://david-dm.org/broidhq/integrations.svg?path=integrations/broid-line
[line-dm-url]: https://david-dm.org/broidhq/integrations?path=integrations/broid-line
[line-npm]: https://img.shields.io/npm/v/broid-line.svg

[callr-url]: https://github.com/broidHQ/integrations/tree/master/integrations/broid-callr
[callr-dm]: https://david-dm.org/broidhq/integrations.svg?path=integrations/broid-callr
[callr-dm-url]: https://david-dm.org/broidhq/integrations?path=integrations/broid-callr
[callr-npm]: https://img.shields.io/npm/v/broid-callr.svg

[twilio-url]: https://github.com/broidHQ/integrations/tree/master/integrations/broid-twilio
[twilio-dm]: https://david-dm.org/broidhq/integrations.svg?path=integrations/broid-twilio
[twilio-dm-url]: https://david-dm.org/broidhq/integrations?path=integrations/broid-twilio
[twilio-npm]: https://img.shields.io/npm/v/broid-twilio.svg

[skype-url]: https://github.com/broidHQ/integrations/tree/master/integrations/broid-skype
[skype-dm]: https://david-dm.org/broidhq/integrations.svg?path=integrations/broid-skype
[skype-dm-url]: https://david-dm.org/broidhq/integrations?path=integrations/broid-skype
[skype-npm]: https://img.shields.io/npm/v/broid-skype.svg

[discord-url]: https://github.com/broidHQ/integrations/tree/master/integrations/broid-discord
[discord-dm]: https://david-dm.org/broidhq/integrations.svg?path=integrations/broid-discord
[discord-dm-url]: https://david-dm.org/broidhq/integrations?path=integrations/broid-discord
[discord-npm]: https://img.shields.io/npm/v/broid-discord.svg

[messenger-url]: https://github.com/broidHQ/integrations/tree/master/integrations/broid-messenger
[messenger-dm]: https://david-dm.org/broidhq/integrations.svg?path=integrations/broid-messenger
[messenger-dm-url]: https://david-dm.org/broidhq/integrations?path=integrations/broid-messenger
[messenger-npm]: https://img.shields.io/npm/v/broid-messenger.svg

[telegram-url]: https://github.com/broidHQ/integrations/tree/master/integrations/broid-telegram
[telegram-dm]: https://david-dm.org/broidhq/integrations.svg?path=integrations/broid-telegram
[telegram-dm-url]: https://david-dm.org/broidhq/integrations?path=integrations/broid-telegram
[telegram-npm]: https://img.shields.io/npm/v/broid-telegram.svg

[kik-url]: https://github.com/broidHQ/integrations/tree/master/integrations/broid-kik
[kik-dm]: https://david-dm.org/broidhq/integrations.svg?path=integrations/broid-kik
[kik-dm-url]: https://david-dm.org/broidhq/integrations?path=integrations/broid-kik
[kik-npm]: https://img.shields.io/npm/v/broid-kik.svg

[flowdock-url]: https://github.com/broidHQ/integrations/tree/master/integrations/broid-flowdock
[flowdock-dm]: https://david-dm.org/broidhq/integrations.svg?path=integrations/broid-flowdock
[flowdock-dm-url]: https://david-dm.org/broidhq/integrations?path=integrations/broid-flowdock
[flowdock-npm]: https://img.shields.io/npm/v/broid-flowdock.svg

[irc-url]: https://github.com/broidHQ/integrations/tree/master/integrations/broid-irc
[irc-dm]: https://david-dm.org/broidhq/integrations.svg?path=integrations/broid-irc
[irc-dm-url]: https://david-dm.org/broidhq/integrations?path=integrations/broid-irc
[irc-npm]: https://img.shields.io/npm/v/broid-irc.svg

[google-assistant-url]: https://github.com/broidHQ/integrations/tree/master/integrations/broid-google-assistant
[google-assistant-dm]: https://david-dm.org/broidhq/integrations.svg?path=integrations/broid-google-assistant
[google-assistant-dm-url]: https://david-dm.org/broidhq/integrations?path=integrations/broid-google-assistant
[google-assistant-npm]: https://img.shields.io/npm/v/broid-google-assistant.svg

[gitter-url]: https://github.com/broidHQ/integrations/tree/master/integrations/broid-gitter
[gitter-dm]: https://david-dm.org/broidhq/integrations.svg?path=integrations/broid-gitter
[gitter-dm-url]: https://david-dm.org/broidhq/integrations?path=integrations/broid-gitter
[gitter-npm]: https://img.shields.io/npm/v/broid-gitter.svg

[nexmo-url]: https://github.com/broidHQ/integrations/tree/master/integrations/broid-nexmo
[nexmo-dm]: https://david-dm.org/broidhq/integrations.svg?path=integrations/broid-nexmo
[nexmo-dm-url]: https://david-dm.org/broidhq/integrations?path=integrations/broid-nexmo
[nexmo-npm]: https://img.shields.io/npm/v/broid-nexmo.svg

### Broid Formats

Broid integrations supports [Activity Streams 2.0](https://t.broid.ai/c/LSB12U?utm_source=github&utm_medium=readme&utm_campaign=formats&link=as2) and uses [broid-schemas](https://t.broid.ai/c/gepuZo?utm_source=github&utm_medium=readme&utm_campaign=formats&link=github-broid-schemas) package to validate input and output message.

|Name|Status|
|:--:|:----:|
|broid-schemas |[![viber][schemas-npm]][schemas-url] [![schemas][schemas-dm]][schemas-dm-url] [![schemas][integration-doc]][schemas-url]|


[schemas-url]: https://github.com/broidHQ/integrations/tree/master/integrations/broid-schemas
[schemas-dm]: https://david-dm.org/broidhq/integrations.svg?path=integrations/broid-schemas
[schemas-dm-url]: https://david-dm.org/broidhq/integrations?path=integrations/broid-schemas
[schemas-npm]: https://img.shields.io/npm/v/broid-schemas.svg


## Contributing

If you have discovered a bug or have a feature suggestion, feel free to create an issue on Github.

If you create a integrations, please consider open sourcing it, putting it
on npm, following the `broid-<xxxx>` convention as a name and create an issue on Github to inform the community.

You are also welcome to correct any spelling mistakes or any language issues.

If you want to discuss something or just need help, [here is our Gitter room](https://t.broid.ai/c/Blwjlw?utm_source=github&utm_medium=readme&utm_campaign=contributing&link=gitter).

### Code of Conduct

Make sure that you're read and understand the [Code of Conduct](http://contributor-covenant.org/version/1/2/0/).

### CLA


To protect the interests of the Broid contributors, Broid, customers and end users we require contributors to sign a [Contributors License Agreement](https://cla-assistant.io/broidhq/integrations) (CLA) before we pull the changes into the main repository. [Our CLA](https://cla-assistant.io/broidhq/integrations) is simple and straightforward - it requires that the contributions you make to any Broid open source project are properly licensed and that you have the legal authority to make those changes. This helps us significantly reduce future legal risk for everyone involved. It's easy---no faxing or printing required!

You can digitally sign the [CLA online](https://cla-assistant.io/broidhq/integrations). Please indicate your email address in your first pull request so that we can make sure that will locate your CLA. Once you've submitted it, you no longer need to send one for subsequent submissions.


## Contributors

[![Broid contributors](https://img.shields.io/badge/Broid%20contributors%20-broidy-%23FF0000.svg?style=flat)](https://github.com/broidy)
[![Broid contributors](https://img.shields.io/badge/Broid%20contributors%20-killix-%23FF0000.svg?style=flat)](https://github.com/killix)



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
