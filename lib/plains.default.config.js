/**
 * Default configuration for Plains.
 */
module.exports = {
  src: './src',
  dist: './dist',
  mode: 'development',
  watch: true,
  plugins: {
    server: {
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
