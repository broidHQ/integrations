import * as fs from 'fs';
import * as nconf from 'nconf';
import * as path from 'path';

// Config
nconf.use('memory');
nconf.argv().env();

const configPath: string = path.join(__dirname, './local.ts');
if (fs.existsSync(configPath)) {
  console.log('Loading config from file');
  console.log(require(configPath).default)
  nconf.defaults(require(configPath).default);
}
