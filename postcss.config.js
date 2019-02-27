const fs = require('fs');
const glob = require('glob');
const path = require('path');

const env = require('./bin/env').init();

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
    'postcss-modules': {
      getJSON: (filename, json) => {
        const dirname = path.dirname(filename.replace(env.PLAINS_SRC, env.PLAINS_DIST));

        if (fs.existsSync(dirname)) {
          const name = path.basename(filename, '.css');

          const jsonPath = path.resolve(dirname, `${name}.cssModules.json`);

          fs.writeFileSync(jsonPath, JSON.stringify(json, null, 2));
        }
      },
      generateScopedName: '[local]',
    },
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
