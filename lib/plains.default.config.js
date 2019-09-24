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
    Cleaner: {
      task: 'clean',
    },
    DataParser: {
      task: 'data',
      entry: ['**/*.json'],
    },
    StyleCompiler: {
      task: 'styles',
      entry: ['base/stylesheets/*.scss'],
    },
    ScriptCompiler: {
      task: 'scripts',
      entry: 'base/javascripts/*/*.js',
    },
    SpriteCompiler: {
      task: 'sprites',
      entry: ['base/images/svg/*.svg'],
      name: 'svgsprite.svg',
      prefix: 'svg--',
    },
    FileSync: {
      task: 'sync',
      entry: 'base/stylesheets/*.scss',
    },
    VendorResolver: {
      task: 'resolve',
      dest: 'base/vendors',
      dependencies: {},
    },
    Watcher: {
      task: 'watch',
      duration: 60000,
    },
  },
};
