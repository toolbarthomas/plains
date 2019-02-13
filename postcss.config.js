const glob = require('glob');

module.exports = function config(e) {
  const plugins = {
    'postcss-at-rules-variables': {},
    'postcss-each': {},
    'postcss-import': {},
    'postcss-for': {},
    'postcss-conditionals': {},
    'postcss-nested': {},
    'postcss-preset-env': {},
    cssnano: {},
  };

  // Define the path of the optional configuration file.
  const maps = glob.sync(`${e.file.dirname}/*.yml`);

  // Include the Postcss Mapping plugin if an YAML configuration file is defined.
  if (maps.length > 0) {
    plugins['postcss-map'] = {
      maps,
    };
  }

  return {
    plugins,
  };
};
