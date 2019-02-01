const Webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');

const logger = require('./logger');
const webpackConfig = require('./webpack-config');

module.exports = PLAINS => {
  const options = webpackConfig.init(PLAINS);

  if (PLAINS.args.serve) {
    const compiler = Webpack(options);

    const { devServer } = webpackConfig;

    const server = new WebpackDevServer(compiler, devServer);

    server.listen(devServer.port, devServer.host, () => {
      logger.info(`Server started at: ${devServer.host}:${devServer.port}`);
    });
  } else {
    Webpack(options, (err, stats) => {
      logger.success('Done!');
    });
  }
};
