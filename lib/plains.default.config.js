/**
 * Default configuration for Plains.
 */
module.exports = {
  src: './src',
  dist: './dist',
  plugins: {
    server: {
      duration: 10000,
      port: 8080,
      directories: ['../'],
    },
  },
  workers: {
    styles: {
      entry: 'base/stylesheets/*.scss',
    },
    scripts: {
      entry: 'base/javascripts/*/*.js',
    },
    sprites: {
      entry: ['base/images/svg/*.svg'],
      name: 'svgsprite.svg',
      prefix: 'svg--',
    },
    sync: {
      entry: 'base/stylesheets/*.scss',
    },
    vendors: {
      dest: 'base/vendors',
      dependencies: {},
    },
  },
};
