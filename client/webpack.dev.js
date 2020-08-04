const merge = require('webpack-merge');
const yaml = require('js-yaml');
const fs = require('fs');
const { baseUrl } = require('./package.json');
const common = require('./webpack.common.js');

const ZERO_HOST = '0.0.0.0';
const LOCALHOST = '127.0.0.1';
const DEFAULT_PORT = 80;

/**
 * Get document, or throw exception on error
 * @returns {{bind_host: string, bind_port: number}}
 */
const importConfig = () => {
    try {
        const doc = yaml.safeLoad(fs.readFileSync('../AdguardHome.yaml', 'utf8'));
        const { bind_host, bind_port } = doc;
        return { bind_host, bind_port };
    } catch (e) {
        console.error(e);
        console.warn(`Using default host: ${ZERO_HOST}, port: ${DEFAULT_PORT}`);
        return { bind_host: ZERO_HOST, bind_port: DEFAULT_PORT };
    }
};

const getDevServerConfig = (proxyUrl = baseUrl) => {
    const { bind_host: host, bind_port: port } = importConfig();
    const { DEV_SERVER_PORT } = process.env;

    const devServerHost = host === ZERO_HOST ? LOCALHOST : host;

    return {
        hot: true,
        host: devServerHost,
        port: DEV_SERVER_PORT || port + 8000,
        proxy: {
            [proxyUrl]: `http://${devServerHost}:${port}`,
        },
    };
};

module.exports = merge(common, {
    devtool: 'eval-source-map',
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'eslint-loader',
                options: {
                    emitWarning: true,
                    configFile: 'dev.eslintrc',
                },
            },
        ],
    },
    devServer: getDevServerConfig(baseUrl),
});
