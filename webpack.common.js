const HtmlWebpackPlugin = require('html-webpack-plugin');
const ModuleFederationPlugin = require('webpack').container.ModuleFederationPlugin;
const DefinePlugin = require('webpack').DefinePlugin;
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { dependencies, peerDependencies } = require('./package.json');
const path = require('path');

const isPatternflyStyles = (stylesheet) =>
  stylesheet.includes('@patternfly/react-styles/css/') ||
  stylesheet.includes('@patternfly/react-core/');

module.exports = () => {
  return {
    entry: path.resolve(__dirname, 'src', 'index.tsx'),
    mode: 'development',
    target: 'web',
    devtool: 'source-map',
    output: {
      path: path.resolve(__dirname, 'dist'),
      publicPath: 'auto',
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js'],
      fallback: {
        http: require.resolve('stream-http'),
        util: require.resolve('util'),
        buffer: require.resolve('buffer'),
      },
    },
    module: {
      rules: [
        {
          test: /\.css$/,
          include: isPatternflyStyles,
          use: ['null-loader'],
          sideEffects: true,
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
        {
          test: /\.tsx?$/,
          loader: 'babel-loader',
          exclude: /node_modules/,
          options: {
            presets: [
              '@babel/preset-typescript',
              ['@babel/preset-react', { runtime: 'automatic' }],
            ],
          },
        },
        {
          test: /\.(ttf|eot|woff|woff2)$/,
          type: 'asset/resource',
        },
      ],
    },
    plugins: [
      new MiniCssExtractPlugin(),
      new ModuleFederationPlugin({
        name: 'httpStep',
        filename: 'remoteEntry.js',
        exposes: {
          './HttpStep': './src/HttpStep',
        },
        shared: {
          ...dependencies,
          ...peerDependencies,
          react: {
            singleton: true,
            requiredVersion: peerDependencies['react'],
          },
          'react-dom': {
            singleton: true,
            requiredVersion: peerDependencies['react-dom'],
          },
          'react-i18next': {
            singleton: true,
            requiredVersion: peerDependencies['react-i18next'],
          },
          'react-router-dom': {
            requiredVersion: peerDependencies['react-router-dom'],
          },
          '@patternfly/patternfly/': {
            singleton: true,
            requiredVersion: peerDependencies['@patternfly/patternfly'],
          },
          '@patternfly/react-core/': {
            singleton: true,
            requiredVersion: peerDependencies['@patternfly/react-core'],
          },
        },
      }),
      new NodePolyfillPlugin(),
      new DefinePlugin({
        browser: true,
        'process.env.NODE_ENV': JSON.stringify('development'),
      }),
      new HtmlWebpackPlugin({
        favicon: path.resolve(__dirname, 'public', 'favicon.ico'),
        template: path.resolve(__dirname, 'public', 'index.html'),
      }),
    ],
  };
};
