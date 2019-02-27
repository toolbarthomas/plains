const glob = require('glob');

module.exports = function config(e) {
  const plugins = {
    'postcss-mixins': {},
    'postcss-at-rules-variables': {},
    'postcss-each': {},
    'postcss-import': {},
    'postcss-for': {},
    'postcss-conditionals': {},
    'postcss-nested-ancestors': {},
    'postcss-nested': {},
    'postcss-preset-env': {},
    'postcss-modules': {},
    cssnano: {},
  };

  // Get all YAML configuration files within the current stylesheet directory.
  const maps = glob.sync(`${e.file.dirname}/*.yml`);

  // Expose the YAML configuration Object as custom variables for Postcss.
  if (maps.length > 0) {
    plugins['postcss-map'] = {
      maps,
    };
  }

  return {
    plugins,
  };
};
