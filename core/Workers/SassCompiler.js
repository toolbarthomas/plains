const { renderSync } = require('node-sass');
const globImporter = require('node-sass-glob-importer');
const { info } = require('../Utils/Logger');

class SassCompiler {
  constructor(services) {
    this.services = services;
    this.taskName = 'sass';

    this.config = {
      entry: [
        './src/base/stylesheets/*.scss',
        'modules/*/stylesheets/*.scss',
      ],
    };
  }

  mount() {
    // Create a new Filesystem stack to define the sass entry files.
    this.services.Filesystem.createStack('sassCompiler');

    // Defines the actual Sass entry files.
    // @TODO include support for config entries
    this.services.Filesystem.insertEntry('sassCompiler', this.config.entry);

    this.services.Contractor.subscribe(this.taskName, this.init.bind(this), true);
  }

  /**
   * Run the Sasscompiler!
   */
  init() {
    const entries = this.services.Filesystem.source('sassCompiler');

    entries.forEach(entry => {
      this.processEntry(entry);
    });
  }

  /**
   * Process the defined Sass entry file.
   *
   * @param {String} entry The path of the current entry that will be processed.
   */
  processEntry(entry) {
    info(`Compiling entry: ${entry}`);

    const chunk = renderSync({
      file: entry,
    });

    // Write the processed entry to the common Filesystem destination.
    this.services.Filesystem.write(chunk.stats.entry, chunk.css, {
      extname: 'css'
    });
  }
}

module.exports = SassCompiler;
