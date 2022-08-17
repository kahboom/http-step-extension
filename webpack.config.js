const HtmlWebpackPlugin = require("html-webpack-plugin");
const ModuleFederationPlugin = require("webpack").container.ModuleFederationPlugin;
const DefinePlugin = require("webpack").DefinePlugin;
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const deps = require("./package.json").dependencies;

module.exports = {
    entry: "./src/index",
    mode: "development",
    target: "web",
    devtool: 'source-map',
    devServer: {
        static: {
            directory: path.join(__dirname, "dist"),
        },
        port: 9001,
    },
    output: {
        publicPath: "auto",
    },
    resolve: {

        extensions: [".ts", ".tsx", ".js"],
        fallback: {
            "http": require.resolve("stream-http"),
            // "https": false,
            "util": require.resolve("util"),
            "buffer": require.resolve("buffer"),

        }
    },
    module: {
        rules: [
            {
                test: /bootstrap\.tsx$/,
                loader: "bundle-loader",
                options: {
                    lazy: true,
                },
            },
            {
                test: /\.tsx?$/,
                loader: "babel-loader",
                exclude: /node_modules/,
                options: {
                    presets: ["@babel/preset-react", "@babel/preset-typescript"],
                },
            },
            {
              test: /\.css$/,
                use: ["style-loader", "css-loader"],
                include: [
                    path.resolve(__dirname, 'src'),
                    path.resolve(__dirname, 'node_modules/patternfly'),
                    path.resolve(__dirname, 'node_modules/@patternfly/patternfly'),
                    path.resolve(__dirname, 'node_modules/@patternfly/react-styles/css'),
                    path.resolve(__dirname, 'node_modules/@patternfly/react-core/dist/styles/base.css'),
                    path.resolve(__dirname, 'node_modules/@patternfly/react-core/dist/esm/@patternfly/patternfly'),
                    path.resolve(__dirname, 'node_modules/@patternfly/react-core/node_modules/@patternfly/react-styles/css'),
                    path.resolve(__dirname, 'node_modules/@patternfly/react-table/node_modules/@patternfly/react-styles/css'),
                    path.resolve(__dirname, 'node_modules/@patternfly/react-inline-edit-extension/node_modules/@patternfly/react-styles/css')
                ],
            }]
    },
    plugins: [
        new MiniCssExtractPlugin(),
        new ModuleFederationPlugin({
            name: "httpStep",
            filename: "remoteEntry.js",
            exposes: {
                "./HttpStep": "./src/HttpStep",
            },
            shared: {
                ...deps,
                react: {
                    singleton: true,
                    requiredVersion: deps.react,
                },
                "react-dom": {
                    singleton: true,
                    requiredVersion: deps["react-dom"],
                },
                "@patternfly/react-core/": {
                    singleton: true
                },
                "@patternfly/react-styles": {
                   singleton: true
                },
                'apidevtools/swagger-parser': {
                    singleton:true,
                }
            }
        }),
        new NodePolyfillPlugin(),
        new HtmlWebpackPlugin({
            template: "./public/index.html",
        }),
        new DefinePlugin({
            browser: true,
          //  'process': '',
            'process.env.NODE_ENV': JSON.stringify("development"),
        }),

    ],
};
