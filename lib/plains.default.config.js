/**
 * Default configuration for Plains.
 */
module.exports = {
  src: './src',
  dist: './dist',
  workers: {
    Cleaner: {
      task: 'clean',
    },
    DataParser: {
      task: 'data',
      entry: ['**/*.json'],
      watch: false,
    },
    StyleCompiler: {
      task: 'styles',
      entry: ['base/stylesheets/*.scss'],
      watch: true,
    },
    ScriptCompiler: {
      task: 'scripts',
      entry: 'base/javascripts/*/*.js',
      watch: false,
    },
    SpriteCompiler: {
      task: 'sprites',
      entry: ['base/images/svg/*.svg'],
      name: 'svgsprite.svg',
      prefix: 'svg--',
      watch: false,
    },
    FileSync: {
      task: 'sync',
      entry: 'base/stylesheets/*.scss',
      watch: false,
    },
    VendorResolver: {
      task: 'resolve',
      dest: 'base/vendors',
      dependencies: {},
      watch: false,
    },
    Watcher: {
      task: 'watch',
      entry: '**/*.js',
      chokidarOptions: {},
      duration: 60000,
    },
  },
};
