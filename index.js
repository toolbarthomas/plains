const Webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');

const config = require('./bin/environment-config').init();
const message = require('./bin/message');

const webpackConfig = require('./bin/webpack-config').init();
const webpackOutput = require('./bin/webpack-output');

const app = () => {
  message.info('Starting Webpack...');

  if (webpackConfig.devServer && config.argv.serve) {
    const compiler = Webpack(webpackConfig);

    const { devServer } = webpackConfig;

    // Inherit the stats option from the defined Webpack environment configuration.
    if (!devServer.stats && webpackConfig.stats) {
      devServer.stats = webpackConfig.stats;
    }

    const server = new WebpackDevServer(compiler, devServer);

    server.listen(devServer.port, devServer.host, () => {
      message.info(`App running and server from: ${devServer.host}:${devServer.port}`);
    });
  } else {
    Webpack(webpackConfig, (err, stats) => {
      webpackOutput(err, stats, webpackConfig);
    });
  }
};

app();
