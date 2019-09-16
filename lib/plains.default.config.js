/**
 * Default configuration for Plains.
 */
module.exports = {
  src: './src',
  dist: './dist',
  devMode: true,
  watch: true,
  plugins: {
    DevServer: {
      port: 8080,
    },
  },
  workers: {
    sass: {},
    sync: {
      entry: 'base/resources/svg/**',
    },
  },
};
