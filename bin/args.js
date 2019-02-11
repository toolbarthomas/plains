module.exports = {
  init() {
    const defaults = this.getDefaults();

    // Prepare the arguments Object to return.
    const args = {};

    if (process.argv.length < 3) {
      return defaults;
    }

    /**
     * Check if the defined paramter has a specific value.
     */
    process.argv.slice(2).forEach(arg => {
      if (arg.indexOf('=') >= 0) {
        const value = String(arg.substring(arg.indexOf('=') + 1));
        const key = String(arg.split('=')[0]);

        // Convert values with true or false to an actual Boolean.
        switch (value.toLowerCase()) {
          case 'true':
            args[key] = true;
            break;
          case 'false':
            args[key] = false;
            break;
          default:
            args[key] = value;
            break;
        }
      } else {
        args[arg] = true;
      }
    });

    return Object.assign(defaults, args);
  },

  /**
   * Returns the default argument values for Plains.
   *
   * @returns {Object} The default configuration Object to return.
   */
  getDefaults() {
    const defaults = {
      serve: false,
      silent: false,
      verbose: false,
    };

    return defaults;
  },
};
