/* eslint-env node */

/* eslint-disable @typescript-eslint/no-require-imports */
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const path = require('path');
/* eslint-enable @typescript-eslint/no-require-imports */

module.exports = {
    entry: {
        main: path.resolve(__dirname, './src/app.ts')
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist')
    },
    devServer: {
        static: './public'
        //open: true
    },
    resolve: {
        modules: ['node_modules'],
        extensions: ['.ts', '.js'],
        mainFields: ['browser', 'module', 'main'],
        alias: { src: path.resolve(__dirname, 'src') }
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/
            },
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: [{ loader: 'ts-loader' }]
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'] // Loaded from right to left.
            },
            {
                test: /\.s[ac]ss$/i,
                use: [
                    // Creates `style` nodes from JS strings
                    'style-loader',
                    // Translates CSS into CommonJS
                    'css-loader',
                    // Compiles Sass to CSS
                    'sass-loader'
                ]
            },
            {
                test: /\.(?:ico|gif|png|jpg|jpeg)$/i,
                type: 'asset/resource'
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, 'public/index.html'),
            title: 'CodeMirror Playground',
            lang: 'en-US'
        }),
        new ESLintPlugin(),
        new CleanWebpackPlugin()
    ],
    performance: { hints: false }
};
