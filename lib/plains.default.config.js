/**
 * Example schema of the base configuration Object for Plains.
 */
module.exports = {
  // Define the working directory where all sources should be defined.
  src: './src',

  // Defines the destination directory where all sourtces should be processed to.
  dist: './dis',

  // Enable debug mode for the application.
  devMode: true,

  workers: {
    Cleaner: {
      task: 'clean',
    },
    SassCompiler: {
      task: 'sass',
      entry: ['**/stylesheets/index.scss', '**/stylesheets/index.scss'],
    },
  },
};
