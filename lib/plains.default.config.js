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
    sass: {},
    scripts: {
      entry: 'base/javascripts/**.js',
    },
    sprites: {
      entry: ['base/images/*/*/foo.svg', 'base/images/*/*/bar.svg'],
      options: {
        prefix: 'svg--',
      },
    },
    sync: {
      entry: 'base/stylesheets/**',
    },
    vendors: {
      dest: 'base/vendors',
      dependencies: {},
    },
  },
};
