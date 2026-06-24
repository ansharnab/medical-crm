const { loadEnv } = require('./load-env');
loadEnv();

const { buildConnectionUrl } = require('./db-url');

const dialect = 'postgres';
const logging = false;

module.exports = {
  development: {
    url: buildConnectionUrl('development'),
    dialect,
    logging,
  },
  test: {
    url: buildConnectionUrl('test'),
    dialect,
    logging,
  },
  staging: {
    url: buildConnectionUrl('staging'),
    dialect,
    logging,
  },
  production: {
    url: buildConnectionUrl('production'),
    dialect,
    logging,
  },
};
