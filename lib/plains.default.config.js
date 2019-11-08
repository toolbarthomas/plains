/**
 * Example schema of the base configuration Object for Plains.
 */
module.exports = {
  // Define the working directory where all sources should be defined.
  src: './src',

  // Defines the destination directory where all sourtces should be processed to.
  dist: './dist',

  // Enable debug mode for the application.
  devMode: true,

  workers: {
    Cleaner: {
      task: 'clean',
    },
    DataParser: {
      entry: '**/*.json',
      task: 'data',
    },
    SassCompiler: {
      entry: ['**/stylesheets/index.scss', '**/stylesheets/index.scss'],
      task: 'sass',
    },
    Watcher: {
      chokidarOptions: {},
      duration: 30000,
      task: 'watch',
    },
  },
};
