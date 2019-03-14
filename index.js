const fs = require('fs');
const path = require('path');
const Webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');

const Plains = require('./bin/Plains');
const Config = require('./bin/Config');
const Logger = require('./bin/utils/Logger');

if (Plains.args.serve) {
  Logger.info('Start the Webpack development server...');

  if (Plains.env.PLAINS_ENVIRONMENT !== 'development') {
    Logger.error([
      'Webpack development server is only allowed for development environments.',
      `You should set "PLAINS_ENVIRONMENT" to "development" within ${path.resolve(
        process.cwd(),
        '.env'
      )}`,
    ]);
  }

  const compiler = Webpack(Config.webpack);
  const { devServer } = Config.webpack;

  const server = new WebpackDevServer(compiler, devServer);
  server.listen(devServer.port, devServer.host, () => {
    Logger.success(`Server started at: ${devServer.host}:${devServer.port}`);
  });
} else {
  Logger.info(`Creating Webpack build for ${Plains.env.PLAINS_ENVIRONMENT}...`);

  Webpack(Config.webpack, (err, stats) => {
    if (err) {
      Logger.error([err.stack || err, err.details ? err.details : null]);
    }

    const info = stats.toJson();

    if (stats.hasErrors()) {
      Logger.error(info.errors);
    }

    if (stats.hasWarnings()) {
      Logger.warning(info.warnings);
    } else {
      if (Plains.args.verbose) {
        Logger.info('Writing Webpack within the working directory...');

        fs.writeFileSync(
          path.resolve(process.cwd(), 'webpack.stats.json'),
          JSON.stringify(stats.toJson(), null, 4)
        );

        Logger.success('Webpack output successfully created.');
      }

      Logger.success('Done!');
    }
  });
}
