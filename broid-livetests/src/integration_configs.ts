import * as nconf from 'nconf';
import { IIntegrationConfigs } from './interfaces';

export const intConfigs: IIntegrationConfigs[] = [
  {
    name: 'Discord',
    Adapter: require('../../broid-discord'),
    configTemplate: {
      token: 'TOKEN',
    },
    to: {
      id: nconf.get('DISCORD_CHANNEL_ID'),
      name: 'general',
      type: 'Group',
    },
    tests: {
      image: true,
      message: true,
      video: true,
    },
  },
  {
    Adapter: require('../../broid-slack'),
    configTemplate: {
      http: {
        host: '127.0.0.1',
        port: 0,
      },
      token: 'TOKEN',
    },
    name: 'Slack',
    tests: {
      message: true,
    },
    to: {
      id: nconf.get('SLACK_CHANNEL_ID'),
      name: 'tests',
      type: 'Group',
    },
  },
];
