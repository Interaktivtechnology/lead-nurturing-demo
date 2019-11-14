const HtmlWebpackPlugin = require('html-webpack-plugin');
const Webpack = require('webpack');
const FaviconWebpack = require('favicons-webpack-plugin');
const uglifyJs = require('uglifyjs-webpack-plugin');



module.exports = (options) => {
    const config = {
        entry: [
            'babel-polyfill', // Load this first
            // 'url-search-params-polyfill', // Load URL Search Params Issue
            'react', // Include this to enforce order
            'react-dom', // Include this to enforce order
            './src/app.js', // Path to your app's entry file
        ],
        devtool: options.isProduction ? '' : 'source-map',
        output: {
            path: `${__dirname}/../dist`,
            filename: options.isProduction ? 'bundle.min.js' : 'bundle.js',
            publicPath: '/',
        },
        module: {
            rules: [
                { test: /\.css$/, loader: 'style-loader!css-loader' },
                {
                    test: /\.scss$/,
                    use: [
                        'style-loader', // creates style nodes from JS strings
                        'css-loader', // translates CSS into CommonJS
                        'sass-loader', // compiles Sass to CSS, using Node Sass by default
                    ],
                },
                {
                    test: /\.js|.jsx$/,
                    loader: 'babel-loader',
                    exclude: /node_modules/,
                    query: { presets: ['es2017', 'react', 'stage-1'] },
                },
                {
                    test: /\.png$/,
                    loader: 'url-loader?limit=100000',
                },
                {
                    test: /\.jpg$/,
                    loader: 'file-loader',
                },
                {
                    test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
                    loader: 'url-loader?limit=10000&mimetype=application/font-woff',
                },
                {
                    test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
                    loader: 'url-loader?limit=10000&mimetype=application/octet-stream',
                },
                {
                    test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
                    loader: 'file-loader?limit=10000',
                },
                {
                    test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
                    loader: 'url-loader?limit=10000&mimetype=image/svg+xml',
                },
            ],
        },
        plugins: [
            new HtmlWebpackPlugin({ template: './src/index.html', title: options.title || 'App', isProduction: options.isProduction }),
            new HtmlWebpackPlugin({ template: './src/404.html', filename: '404.html' }),
            new FaviconWebpack({
                logo: './src/static/img/interaktiv-logo.png',
            }),
        ],
    };
    if (options.isProduction) {
        config.plugins.push(new uglifyJs());
    } else {
        config.devServer = {
            proxy: {
                '/**': {
                    target: '/index.html',
                    secure: false,
                    bypass: (req, res, opt) => {
                        if (req.path.indexOf('/img/') !== -1 || req.path.indexOf('/public/') !== -1) {
                            return '/';
                        }
                        if (req.headers.accept) {
                            if (req.headers.accept.indexOf('html') !== -1) {
                                return '/index.html';
                            }
                        }
                    },
                },
            },
        };
    }
    return config;
};
