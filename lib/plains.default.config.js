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
      watch: true,
    },
    StyleCompiler: {
      task: 'styles',
      entry: ['base/stylesheets/*.scss'],
      watch: true,
    },
    ScriptCompiler: {
      task: 'scripts',
      entry: 'base/javascripts/*/*.js',
      watch: true,
    },
    SpriteCompiler: {
      task: 'sprites',
      entry: ['base/images/svg/*.svg'],
      name: 'svgsprite.svg',
      prefix: 'svg--',
      watch: true,
    },
    FileSync: {
      task: 'sync',
      entry: 'base/stylesheets/*.scss',
      watch: true,
    },
    VendorResolver: {
      task: 'resolve',
      dest: 'base/vendors',
      dependencies: {},
      watch: true,
    },
    Watcher: {
      task: 'watch',
      entry: '**/*.js',
      chokidarOptions: {},
      duration: 60000,
    },
  },
};
