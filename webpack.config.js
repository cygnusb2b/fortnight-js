const webpack = require('webpack');
const { resolve } = require('path');
const { getIfUtils, removeEmpty } = require('webpack-config-utils');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

const srcDir = resolve(__dirname, 'src');

module.exports = function(env) {
  const { ifProd, ifNotProd } = getIfUtils(env);
  return {
    cache: ifNotProd(),
    entry: {
      'fortnight': [
        resolve(srcDir, 'index.js'),
      ],
    },
    devtool: ifProd('source-map', 'cheap-eval-source-map'),
    resolve: {
      extensions: ['.js', '.json'],
      modules: [
        srcDir,
        resolve(__dirname, 'node_modules'),
      ],
    },
    output: {
      filename: '[name].min.js',
      path: resolve(__dirname, 'dist'),
      library: 'Fortnight',
      libraryTarget: 'umd',
      // umdNamedDefine: true,
    },
    devServer: {
      port: process.env.SERVER_PORT || 3081,
      // proxy: {
      //   '/component': {
      //     target: serverUrl,
      //     secure: false,
      //     changeOrigin: true,
      //   },
      // },
    },
    module: {
      rules: removeEmpty([
        {
          test: /\.jsx?$/,
          include: [ srcDir ],
          enforce: 'pre',
          loader: 'eslint-loader',
        },
        {
          test: /\.jsx?$/,
          include: [ srcDir ],
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                ['env', {
                  modules: false,
                  debug: true,
                }],
              ],
            },
          },
        },
      ]),
    },
    plugins: removeEmpty([
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: ifProd('"production"', '"development"')
        }
      }),

      ifNotProd(new HtmlWebpackPlugin({
        template: resolve(__dirname, 'src/index.html'),
        inject: true,
      })),

      ifProd(new webpack.LoaderOptionsPlugin({
        minimize: true,
        debug: true
      })),

      ifProd(new UglifyJsPlugin({
        sourceMap: true
      })),

    ]),
  };
};
