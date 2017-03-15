[![npm][npm]][npm-url]
[![node][node]][node-url]
[![deps][deps]][deps-url]
[![tests][tests]][tests-url]
[![bithound][bithound]][bithound-url]
[![bithoundscore][bithoundscore]][bithoundscore-url]
[![nsp-checked][nsp-checked]][nsp-checked-url]

# Broid

Broid Integrations is an open source project providing a suite of Activity Streams 2 libraries for unified interface among a vast number of communication platforms.

> Connect your App to Multiple Messaging Channels with the W3C Open standard.

<br>
<a href="https://github.com/broidHQ/integrations">
<img alt="Broid.ai" src="https://t.broid.ai/i/b-github-cover?utm_source=github&utm_medium=readme&utm_campaign=cover#a">
</a>
<br>
<br>



## Introduction

Broid Integrations provide a suite of libraries to convert all messaging platforms events to [Activity Streams 2](https://t.broid.ai/c/LSB12U?utm_source=github&utm_medium=readme&utm_campaign=introduction&link=as2) schemas.

**TL;DR**

* All events are Observables ([RxJS](https://github.com/ReactiveX/rxjs))
* All functions return a Promise ([Bluebird](http://bluebirdjs.com/docs/getting-started.html))
* Highly modular to keep your focus on high level features

### Quick Example

A quick example showing off listening for new messages on Facebook Messenger and Discord with Observables.

```shell
npm i --save broid-messenger broid-discord rxjs ramda
```

```javascript
const Rx = require("rxjs/Rx");
const R = require("ramda");
const BroidDiscord = require("broid-discord");
const BroidMessenger = require("broid-messenger");

const clients = {
	discord: new BroidDiscord({token: 'DISCORD_TOKEN'}),
	messenger: new BroidMessenger({token: 'FACEBOOK_TOKEN', tokenSecret: 'FACEBOOK_SECRET'})
};

Rx.Observable.merge(...R.map(client => client.connect(), R.values(clients)))
	.subscribe({
		next: data => console.log(JSON.stringify(data, null, 2)),
		error: err => console.error(`Something went wrong: ${err.message}`),
	});

Rx.Observable.merge(...R.map(client => client.listen(), R.values(clients)))
	.subscribe({
		next: message => console.log(JSON.stringify(message, null, 2)),
		error: err => console.error(`Something went wrong: ${err.message}`),
	});
```

### Get Started

Check out Broid's quick [**Get Started**](https://t.broid.ai/c/MRAxh0?utm_source=github&utm_medium=readme&utm_campaign=get-started) guide to get a better feel of what Broid is capable of.


<a name="integrations"></a>
## Integrations

Broid Integrations support simple, media and rich messages (location, carroussel) and split into multiple libraries.
This make Broid **flexible** and **useful** to use in your application.

#### Node packages
|     | Name  | Status |
| :-- | :---- | :----  |
| alexa | broid-alexa | [![alexa][alexa-npm]][alexa-url] |


### Broid Formats

Broid integrations supports [Activity Streams 2.0](https://t.broid.ai/c/LSB12U?utm_source=github&utm_medium=readme&utm_campaign=formats&link=as2) and uses [broid-schemas](https://t.broid.ai/c/gepuZo?utm_source=github&utm_medium=readme&utm_campaign=formats&link=github-broid-schemas) package to validate input and output message.

|Name|Status|
|:--:|:----:|
|broid-schemas |[![schemas][schemas-npm]][schemas-url] [![schemas][schemas-dm]][schemas-dm-url] [![schemas][integration-doc-badge]][schemas-url]|

[schemas-url]: https://github.com/broidHQ/integrations/tree/master/broid-schemas
[schemas-dm]: https://david-dm.org/broidhq/integrations.svg?path=broid-schemas
[schemas-dm-url]: https://david-dm.org/broidhq/integrations?path=broid-schemas
[schemas-npm]: https://img.shields.io/npm/v/broid-schemas.svg

## Contributing

If you have discovered a bug or have a feature suggestion, feel free to create an issue. If you create a integration, feel free to open a Pull Request!

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
[![Broid contributors](https://img.shields.io/badge/Broid%20contributors%20-dustinblackman-%23FF0000.svg?style=flat)](https://github.com/dustinblackman)




[alexa-url]: https://github.com/broidHQ/integrations/tree/master/broid-alexa
[alexa-dm]: https://david-dm.org/broidhq/integrations.svg?path=broid-alexa
[alexa-dm-url]: https://david-dm.org/broidhq/integrations?path=broid-alexa
[alexa-npm]: https://img.shields.io/npm/v/broid-alexa.svg

[integration-doc-badge]: https://img.shields.io/badge/docs--green.svg?style=flat

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

[gitter]: https://badges.gitter.im/broidHQ/broid.svg
[gitter-url]: https://badges.gitter.im/broidHQ/broid.svg)](https://t.broid.ai/c/Blwjlw?utm_source=github&utm_medium=readme&utm_campaign=top&link=gitter
