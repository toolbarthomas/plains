const Webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const logger = require('./bin/logger');

const args = require('./bin/args').init();
const env = require('./bin/env').init();
const config = require('./bin/config').init(args, env);

// Start Plains
if (args.serve) {
  const compiler = Webpack(config);
  const { devServer } = config;

  const server = new WebpackDevServer(compiler, devServer);

  server.listen(devServer.port, devServer.host, () => {
    logger.info(`Server started at: ${devServer.host}:${devServer.port}`);
  });
} else {
  Webpack(config, err => {
    if (err) {
      logger.error(err);
    } else {
      logger.success('Done!');
    }
  });
}
