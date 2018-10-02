const chalk = require('chalk');
const path = require('path');

/**
 * Dislay a messages with Chalk with an reference to the defined module.
 *
 * @param {String} message The actual message to display.
 * @param {String} type Defines the color of the message.
 */
module.exports = (message, type) => {
  const label = `[ ${path
    .basename(module.parent.filename, '.js')
    .toUpperCase()} ]`;

  const ouput = `${label} ${message}`;

  switch (type) {
    case 'error':
      console.error(chalk.red(ouput));
      break;
    case 'warning':
      console.error(chalk.orange(ouput));
      break;
    case 'success':
      console.error(chalk.green(ouput));
      break;
    default:
      console.log(chalk.yellow(ouput));
      break;
  }
};
