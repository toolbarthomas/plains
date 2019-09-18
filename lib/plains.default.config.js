/**
 * Default configuration for Plains.
 */
module.exports = {
  src: './src',
  dist: './dist',
  mode: 'production',
  watch: true,
  plugins: {
    server: {
      duration: 10000,
      port: 8080,
      directories: ['../'],
    },
  },
  workers: {
    sass: {},
    vendors: {
      dest: 'base/vendors',
      dependencies: {},
    },
    sync: {
      entry: 'base/stylesheets/**',
    },
  },
};
