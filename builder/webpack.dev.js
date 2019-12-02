const createConfig = require('./webpack.config');

module.exports = {
  ...createConfig(),
  mode: 'development',
  watch: true,
  performance: {
    hints: false,
  },
};
