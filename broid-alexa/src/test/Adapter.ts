import ava from 'ava';

import { Adapter } from '../core/Adapter';

let adapter: Adapter;
ava.before(() => {
  adapter = new Adapter({
    http: {
      host: '0.0.0.0',
      port: 8080,
    },
    logLevel: 'debug',
    serviceID: 'adapter',
  });
});

ava('Adapter should have all methods', async (t) => {
  const funcs = [
    'channels',
    'connect',
    'disconnect',
    'getRouter',
    'listen',
    'send',
    'serviceId',
    'serviceName',
    'users',
  ];

  funcs.forEach((func) => t.is(typeof adapter[func], 'function'));
});
