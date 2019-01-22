const fs = require('fs');
const path = require('path');

const message = require('./message');

/**
 * Callback function for the Webpack compiler that outputs any errors or warnings and write
 * the actual log to the working directory.
 *
 * @param {*} err The initial Error stacktrace inherited from Webpack.
 * @param {*} stats The defined stats output defined by Webpack.
 */
const webpackOutput = (err, stats, webpackConfig) => {
  if (err) {
    message.error(err.stack || err);

    if (err.details) {
      message.error(err.details);
    }

    return;
  }

  // Define the options to use when displaying the Webpack stats.
  const outputOptions = webpackConfig.stats || 'minimal';

  // Define the log as json Object to save it to the filesystem.
  const output = {
    info: stats.toJson(outputOptions),
    raw: stats.toString(outputOptions),
  };

  if (stats.hasErrors()) {
    message.error(output.info.errors);
  }

  if (stats.hasWarnings()) {
    message.warning(output.info.warnings);
  }

  // Outputs the initial log within the console.
  if (outputOptions !== 'none' && output.raw.length > 0) {
    // eslint-disable-next-line
    console.log(output);
  }

  const dir = process.cwd();
  const file = path.resolve(dir, `.webpack.stats.${config.PLAINS_ENVIRONMENT}.json`);

  message.success('Created Webpack build successfully!');

  // Writes the generated log within the current working directory.
  if (output.raw.length > 0) {
    message.info('Writing Webpack log to the filesystem...');

    fs.writeFileSync(file, JSON.stringify(output.raw, null, 2));

    message.success(`Log successfully created at: ${file}`);
  }
};

module.exports = webpackOutput;
