const { render } = require('node-sass');
const globImporter = require('node-sass-glob-importer');
const { error, info, log, warning } = require('../Utils/Logger');

class SassCompiler {
  constructor(services) {
    this.services = services;
    this.taskName = 'sass';

    // Keep track of the compilation & linting errors and output it to the user.
    this.errors = {
      sass: false,
    };

    // @TODO use default object for worker to validate the actual worker configuration.
    this.defaults = {
      entry: [],
    }
  }

  mount() {
    // Get the specific sassCompiler configuraiton that has been defined
    // by the ConfigManager service.
    this.config = this.services.Store.get('plains', 'workers')['sassCompiler'] || {};

    // Create a new Filesystem stack to define the sass entry files.
    this.services.Filesystem.createStack('sassCompiler');

    // Defines the actual Sass entry files that are defined within the configuration.
    // @TODO include support for config entries
    this.services.Filesystem.insertEntry('sassCompiler', this.config.entry);

    // Expose the SassCompiler worker task.
    this.services.Contractor.subscribe(this.taskName, this.init.bind(this), true);
  }

  /**
   * Run the Sasscompiler!
   */
  async init() {
    // Get the defined entry file.
    // @todo check if there is an entry file defined within the wachter queue.
    const entries = this.services.Filesystem.source('sassCompiler');

    // Process each entry in parallel order.
    const compiler = entries.map(async (entry) => {
      await this.processEntry(entry);
    });

    // Wait for each processes.
    await Promise.all(compiler);

    // Notify the user about the Compiler errors.
    if (this.errors.sass) {
      warning('Done compiling, but encountered some errors.');
      this.errors.sass = false;
    }

    // Resolve the contractor Task.
    this.services.Contractor.resolve(this.taskName);
  }

  /**
   * Process the defined Sass entry file.
   *
   * @param {String} entry The path of the current entry that will be processed.
   */
  processEntry(entry) {
    return new Promise((cb) => {
      info(`Compiling entry: ${entry}`);

      render({
        file: entry,
        outputStyle: 'compact',
        importer: globImporter(),
        includePaths: [this.services.Filesystem.getRoot()],
        outFile: this.services.Filesystem.getEntryDestination(entry, 'css'),
        sourceMap: this.services.Store.get('plains', 'devMode'),
      }, async (err, chunk) => {
        if (err) {
          // Make sure the user is notified if Sass encounters any errors.
          this.errors.sass = true;

          // Output any Syntax errors.
          error([
            `Error at: ${err.file}:${err.line}:${err.column}`,
            err.message,
          ], true)
        } else {
          log(`Creating stylesheet for: ${entry}`);

          // Write the actual processed stylesheet.
          await this.services.Filesystem.write(entry, chunk.css, {
            extname: 'css'
          });

          // Generates the sourcemap if enabled within the configuration.
          if (chunk.map) {
            log(`Creating sourcemap for: ${entry}`);

            await this.services.Filesystem.write(entry, chunk.map, {
              extname: 'css.map'
            });
          }
        }

        cb();
      });
    });
  }
}

module.exports = SassCompiler;
