import HtmlWebpackPlugin from 'html-webpack-plugin';
import ESLintPlugin from 'eslint-webpack-plugin';
import path from 'path';

export default {
    entry: {
        main: path.resolve(import.meta.dirname, './src/app.ts')
    },
    output: {
        filename: '[name].js',
        chunkFilename: '[name].[contenthash].js',
        path: path.resolve(import.meta.dirname, 'dist'),
        clean: true
    },
    devServer: {
        static: './public'
    },
    resolve: {
        modules: ['node_modules'],
        extensions: ['.ts', '.js'],
        mainFields: ['browser', 'module', 'main'],
        alias: { src: path.resolve(import.meta.dirname, 'src') },
        symlinks: false
    },
    snapshot: { managedPaths: [/^(.+?[\\/]node_modules[\\/](?!(codemirror-lang-pg))(@.+?[\\/])?.+?)[\\/]/] },
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
            template: path.resolve(import.meta.dirname, 'public/index.html'),
            title: 'CodeMirror Playground',
            lang: 'en-US'
        }),
        new ESLintPlugin({ configType: 'flat' })
    ],
    optimization: {
        splitChunks: {
            chunks: 'all',
            cacheGroups: { defaultVendors: false }
        }
    },
    performance: { hints: false }
};
