const { render } = require('node-sass');
const globImporter = require('node-sass-glob-importer');
const { error, info, log, success, warning } = require('../Utils/Logger');

/**
 * Core worker for Plains that compiles Sass files to stylesheets with optional
 * mapping.
 */
class SassCompiler {
  constructor(services) {
    this.services = services;
    this.task = 'sass';

    // Keep track of the compilation & linting errors and output it to the user.
    this.exceptions = {
      sass: [],
    };

    // @TODO use defaults object for worker to validate the actual worker configuration.
    this.defaults = {
      entry: [],
    }
  }

  /**
   * Prepare the SassCompiler instance.
   */
  mount() {
    // Get the specific sassCompiler configuraiton that has been defined
    // by the ConfigManager service.
    this.config = this.services.Store.get('plains', 'workers')[this.task] || {};

    // Create a new Filesystem stack to define the sass entry files.
    this.services.Filesystem.createStack(this.task);

    // Defines the actual Sass entry files that are defined within the configuration.
    // @TODO include support for config entries.
    this.services.Filesystem.insertEntry(this.task, this.config.entry);

    // Subscribe the SassCompiler as Contractor task.
    this.services.Contractor.subscribe(this.task, this.init.bind(this), true, true);
  }

  /**
   * Run the Sasscompiler!
   */
  async init() {
    // Get the defined entry file.
    // @todo check if there is an entry file defined within the wachter queue.
    const entries = this.services.Filesystem.getStack(this.task);

    // Process each entry in parallel order.
    const compiler = entries.map(async (entry) => {
      await this.processEntry(entry);
    });

    // Proces each entry asyncronously.
    await Promise.all(compiler);

    // Output any encountered exceptions before resolving to ensure the
    // exception are not directly visible within the shell.
    this.outputExceptions();

    this.services.Contractor.resolve(this.task);
  }

  /**
   * Process the defined Sass entry file.
   *
   * @param {String} entry The path of the current entry that will be processed.
   */
  processEntry(entry) {
    return new Promise((cb) => {
      info(`Render sass entry: ${entry.path}`);

      render({
        file: entry.path,
        outputStyle: 'compact',
        importer: globImporter(),
        includePaths: [this.services.Filesystem.resolveSource()],
        outFile: this.services.Filesystem.resolveEntryPath(entry, '{name}.css'),
        sourceMap: this.services.Store.get('plains', 'devMode'),
      }, async (exception, chunk) => {
        if (exception) {
          // Store the exception of the current entry since it encountered CSS
          // errors.
          this.exceptions.sass.push({
            file: exception.file,
            line: exception.line,
            column: exception.column,
            message: exception.message
          });

          cb();
        } else {
          this.services.Filesystem.writeFiles(
            [entry, chunk.css, '{name}.css'],
            [entry, chunk.map, '{name}.css.map'],
          ).then(() => {
            cb();
          });
        }
      });
    });
  }

  /**
   * Output the encountered Errors of Node Sass.
   */
  outputExceptions() {
    // Notify the user about the Compiler errors.
    if (this.exceptions && this.exceptions.sass.length) {
      // Output the encountered syntax errors.
      this.exceptions.sass.forEach(exception => {
        error([
          `Error at: ${exception.file}:${exception.line}:${exception.column}`,
          exception.message,
        ], true);
      });

      if (this.services.Store.get('plains', 'devMode')) {
        warning('Done compiling, but encountered some errors.');
      } else {
        error(`Encountered some errors during compilation...`);
      }

      this.exceptions.sass = [];
    } else {
      success('Successfully compiled all entries without any errors.')
    }
  }
}

module.exports = SassCompiler;
