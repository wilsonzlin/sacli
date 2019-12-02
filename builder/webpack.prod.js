const createConfig = require('./webpack.config');

module.exports = {
  ...createConfig(),
  mode: 'production',
};
