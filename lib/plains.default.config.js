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
    sync: {
      entry: 'base/stylesheets/**',
    },
    scripts: {
      entry: 'base/javascripts/**.js',
    },
    vendors: {
      dest: 'base/vendors',
      dependencies: {},
    },
  },
};
