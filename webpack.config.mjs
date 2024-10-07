import path from 'path';
import ESLintPlugin from 'eslint-webpack-plugin';

export default (_env, argv) => {
    process.env.NODE_ENV = argv.mode ?? 'development';

    return {
        entry: { 'pg-codemirror-editor': path.resolve(import.meta.dirname, './src/pg-codemirror-editor.ts') },
        output: {
            filename: '[name].js',
            chunkFilename: 'extensions/[name].[contenthash].js',
            path: path.resolve(import.meta.dirname, 'dist'),
            library: { name: 'PGCodeMirrorEditor', type: 'var' },
            clean: true
        },
        devServer: { static: './public' },
        devtool: process.env.NODE_ENV === 'development' ? 'source-map' : false,
        resolve: {
            modules: ['node_modules'],
            extensions: ['.ts', '.js'],
            mainFields: ['browser', 'module', 'main'],
            alias: { src: path.resolve(import.meta.dirname, 'src') },
            symlinks: false
        },
        snapshot: {
            managedPaths: [/^(.+?[\\/]node_modules[\\/](?!(@openwebwork[\\/]codemirror-lang-pg))(@.+?[\\/])?.+?)[\\/]/]
        },
        module: {
            rules: [
                { test: /\.js$/, exclude: /node_modules/ },
                { test: /\.ts$/, exclude: /node_modules/, use: [{ loader: 'ts-loader' }] },
                { test: /\.css$/, use: ['style-loader', 'css-loader'] },
                { test: /\.s[ac]ss$/i, use: ['style-loader', 'css-loader', 'sass-loader'] },
                { test: /\.(?:ico|gif|png|jpg|jpeg)$/i, type: 'asset/resource' }
            ]
        },
        plugins: [new ESLintPlugin({ configType: 'flat' })],
        optimization: {
            splitChunks: {
                chunks: 'all',
                cacheGroups: {
                    defaultVendors: false,
                    '@lezer/lr': {
                        test: /[\\/]node_modules[\\/]@lezer\/lr[\\/]/,
                        name: 'lezer-lr',
                        reuseExistingChunk: true
                    }
                }
            }
        },
        performance: { hints: false }
    };
};
