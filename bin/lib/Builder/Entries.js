const { basename, resolve } = require('path');
const { statSync } = require('fs');
const { sync } = require('glob');
const merge = require('webpack-merge');

class Entries {
  constructor(args, env) {
    this.args = args;
    this.env = env;

    this.config = {
      context: resolve(env.PLAINS_DIST),
      entry: {},
    };
  }

  /**
   * Define the Webpack entry file for each template directory
   */
  define() {
    const path = resolve(this.env.PLAINS_SRC, this.env.PLAINS_TEMPLATES_PATH);
    const entries = sync(`${path}/*/index.js`).filter(entry => (
      statSync(entry).size
    ));

    entries.forEach(entry => {
      const name = basename(entry, '.js');

      const config = {
        entry: {}
      };

      config.entry[name] = [entry];

      if (this.env.PLAINS_DEVMODE) {
        const address = `http://${this.env.PLAINS_HOSTNAME}:${this.env.PLAINS_PORT}`;

        config.entry[name].unshift(`webpack-dev-server/client?${address}`);
      }

      this.config = merge(this.config, config);
    });
  }
}

module.exports = Entries;
