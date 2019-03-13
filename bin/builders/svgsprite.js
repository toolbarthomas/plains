const _ = require('lodash');
const path = require('path');
const fs = require('fs');
const glob = require('glob');
const SVGSpritemapPlugin = require('svg-spritemap-webpack-plugin');

const env = require('../env').init();

/**
 * Glob for all SVG resources and create a new SVG Sprite Map instance
 * for the defined working directory.
 *
 * @param {String} rootDirectory The relative path to the current Plain directory.
 *
 * @return {Function} SVGSpriteMapPlugin Instance
 */
function prepareMap(rootDirectory, cwd) {
  const svgDir = path.join(env.PLAINS_RESOURCES_DIRNAME, 'svg');

  // Define the globbing svg sourcepath.
  const source = path.join(rootDirectory, svgDir, '**/*.svg');

  // Define the relative destination path for the current spritemap.
  const destination = path.relative(cwd, rootDirectory);

  // Create a new SVG Spritemap instance for the current Plain.
  return new SVGSpritemapPlugin(source, {
    output: {
      filename: path.join(destination, svgDir, 'svgsprite.svg'),
      svgo: {
        plugins: [
          {
            removeTitle: true,
          },
        ],
      },
    },
    sprite: {
      prefix: 'svgsprite--',
      generate: {
        title: false,
        symbol: true,
        use: true,
        view: false,
      },
    },
  });
}

/**
 * Check if the given path is an actual template directory by checking for an
 * existsing `resources` directory.
 *
 * @param {Array} dirnames The dirnames to compare with the resource directory
 * name.
 *
 * @return {Boolean} Returns true if the `resource` directory exists.
 */
function isTemplateDirectory(dirnames) {
  return (
    dirnames.filter(dirname => {
      return dirname === path.basename(env.PLAINS_RESOURCES_DIRNAME);
    }).length > 0
  );
}

module.exports = (() => {
  // Store each Spritemap Instance and export it for Webpack.
  const plugins = [];

  // Define the relative source path from the current working directory.
  const cwd = path.relative('./', env.PLAINS_SRC);

  // Define the base directories for each Plain
  const directories = [
    path.join(cwd, env.PLAINS_BASE_PATH),
    path.join(cwd, env.PLAINS_TEMPLATES_PATH),
  ];

  /**
   * Iterate trough each starting directory and define a new SVGSpriteMapPlugin
   * if the given directory has any SVG files.
   */
  directories.forEach(directory => {
    // Resolve the relative directory path and check if it actually exists.
    if (!fs.existsSync(path.resolve(directory))) {
      return;
    }

    // Get all subdirectories within the current starting directory.
    const dirnames = fs
      .readdirSync(directory)
      .filter(dirname => fs.statSync(path.join(directory, dirname)).isDirectory());

    /**
     * Loop trough all subdirectories within the current Plain directory and
     * define each SVG Spritemap instance if any SVG files excists.
     */
    if (isTemplateDirectory(dirnames)) {
      const plugin = prepareMap(directory, cwd);

      if (plugin) {
        plugins.push(plugin);
      }
    } else {
      dirnames.forEach(dirname => {
        const plugin = prepareMap(path.join(directory, dirname), cwd);

        if (plugin) {
          plugins.push(plugin);
        }
      });
    }
  });

  return {
    plugins,
  };
})();
