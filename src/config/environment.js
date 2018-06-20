// External dependencies
const dotenv = require('dotenv');

// Environment variables
let environment;
let path;
const env = '.puienv';

switch(process.env.NODE_ENV) {
  case 'production':
    environment = '';
    path = `/src/${env}`;
    break;
  case 'develop':
    environment = 'DEV_';
    path = `/src/${env}`;
    break;

  default:
    environment: 'TEST_';
    path: `${process.env.HOME}/${env}`;
    break;
}

// Configure dotenv
dotenv.config({ path });

module.exports = environment;