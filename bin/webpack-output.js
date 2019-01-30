const fs = require('fs');
const path = require('path');

const message = require('./message');
const config = require('./environment-config').init();

/**
 * Callback function for the Webpack compiler that outputs any errors or warnings and write
 * the actual log to the working directory.
 *
 * @param {*} err The initial Error stacktrace inherited from Webpack.
 * @param {*} stats The defined stats output defined by Webpack.
 */
const webpackOutput = (err, stats, webpackConfig) => {
  if (err) {
    const errors = [err.stack || err];

    if (err.details) {
      errors.push(err.details);
    }

    message.error(errors);
  }

  // Define the options to use when displaying the Webpack stats.
  const outputOptions = webpackConfig.stats || true;

  // Define the log as json Object to save it to the filesystem.
  const info = stats.toJson(outputOptions);

  if (stats.hasErrors()) {
    message.error(info.errors);
  }

  if (stats.hasWarnings()) {
    message.warning(info.warnings);
  }

  // Outputs the initial log within the console.
  if (config.argv.verbose) {
    // eslint-disable-next-line
    console.log(info);
  }

  const file = path.resolve(process.cwd(), `.webpack.stats.${config.PLAINS_ENVIRONMENT}.json`);

  // Writes the generated log within the current working directory.
  if (info instanceof Object && Object.keys(info).length > 0 && config.argv.log !== false) {
    message.info('Writing Webpack log to the filesystem...');

    fs.writeFileSync(file, JSON.stringify(info, null, 2));

    message.success(`Log successfully created at: ${file}`);
  }

  message.success('Done!');
};

module.exports = webpackOutput;
