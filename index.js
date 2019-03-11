const fs = require('fs');
const path = require('path');
const Webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');

const logger = require('./bin/logger');
const args = require('./bin/args').init();

const env = require('./bin/env').init(args);
const config = require('./bin/config').init(args, env);

// Start Plains
if (args.serve) {
  logger.info('Start the Webpack development server...');

  if (env.PLAINS_ENVIRONMENT !== 'development') {
    logger.error([
      'Webpack development server is only allowed for development environments.',
      `You should set "PLAINS_ENVIRONMENT" to "development" within ${path.resolve(
        process.cwd(),
        '.env'
      )}`,
    ]);
  }

  const compiler = Webpack(config);
  const { devServer } = config;

  const server = new WebpackDevServer(compiler, devServer);

  server.listen(devServer.port, devServer.host, () => {
    logger.success(`Server started at: ${devServer.host}:${devServer.port}`);
  });
} else {
  logger.info(`Creating Webpack build for ${env.PLAINS_ENVIRONMENT}...`);

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
      if (args.verbose) {
        logger.info('Writing Webpack within the working directory...');

        fs.writeFileSync(
          path.resolve(process.cwd(), 'webpack.stats.json'),
          JSON.stringify(stats.toJson(), null, 4)
        );

        logger.success('Webpack output successfully created.');
      }

      logger.success('Done!');
    }
  });
}
