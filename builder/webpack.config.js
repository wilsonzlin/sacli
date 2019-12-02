const {realpathSync} = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = () => ({
  entry: [
    realpathSync('src/index.js'),
  ],
  output: {
    path: realpathSync('dist'),
  },
  plugins: [
    new HtmlWebpackPlugin({inject: true, template: realpathSync('src/index.html')}),
  ],
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
});
