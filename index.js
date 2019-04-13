const fs = require('fs');
const path = require('path');
const Webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');

const Plains = require('./bin/Plains');

if (Plains.args.serve) {
  Plains.log.info('Setting up the development environment.');

  if (Plains.env.PLAINS_ENVIRONMENT !== 'development') {
    Plains.log.error([
      'Running the devServer is only enabled for development environments.',
      'Please define your environment within the dotenv file.',
    ]);
  }

  const { config = {} } = Plains.builder;

  // Define the Webpack instance to use within the devServer.
  const builder = Webpack(config);

  // Use the Webpack devServer config from Plains.
  const { devServer = {} } = config;

  // Define a new development Server.
  const server = new WebpackDevServer(builder, devServer);

  server.listen(devServer.port, devServer.host, () => {
    Plains.log.success(`Server started at: ${devServer.host}:${devServer.port}`);
  });
} else {
  Plains.log.info(`Creating Webpack build for ${Plains.env.PLAINS_ENVIRONMENT}...`);

  const { config = {} } = Plains.builder;

  Webpack(config, (err, stats) => {
    if (err) {
      Plains.log.error([err.stack || err, err.details ? err.details : null]);
    }

    const info = stats.toJson();

    if (stats.hasErrors()) {
      Plains.log.error(info.errors);
    }

    if (stats.hasWarnings()) {
      Plains.log.warning(info.warnings);
    } else {
      if (Plains.args.verbose) {
        Plains.log.info('Writing Webpack within the working directory...');

        fs.writeFileSync(
          path.resolve(process.cwd(), 'webpack.stats.json'),
          JSON.stringify(stats.toJson(), null, 4)
        );

        Plains.log.success('Webpack output successfully created.');
      }

      Plains.log.success(`Done! [${Plains.outputTime()}]`);
    }
  });
}
