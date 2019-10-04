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
    DevServer: {
      task: 'serve',
      duration: 1000 * 60 * 15,
    },
    FileSync: {
      task: 'sync',
      entry: 'base/stylesheets/*.scss',
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
    TemplateCompiler: {
      task: 'templates',
      entry: ['**/*.twig'],
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
      duration: 1000 * 60 * 15,
    },
  },
};
