const Webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const logger = require('./bin/logger');

const args = require('./bin/args').init();
const env = require('./bin/env').init(args);
const config = require('./bin/config').init(args, env);

// Start Plains
if (args.serve) {
  const compiler = Webpack(config);
  const { devServer } = config;

  const server = new WebpackDevServer(compiler, devServer);

  server.listen(devServer.port, devServer.host, () => {
    logger.success(`Server started at: ${devServer.host}:${devServer.port}`);
  });
} else {
  Webpack(config, (err, stats) => {
    if (err) {
      logger.error([err.stack || err, err.details ? err.details : null]);
    }

    const info = stats.toJson();

    if (stats.hasErrors()) {
      logger.error(info.errors);
    }

    if (stats.hasWarnings()) {
      logger.warning(info.warnings);
    } else {
      logger.success('Done!');
    }
  });
}
