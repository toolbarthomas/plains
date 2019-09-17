const { render } = require('node-sass');
const globImporter = require('node-sass-glob-importer');

const Worker = require('./Worker');
const { error, log, warning, success } = require('../Utils/Logger');

class SassCompiler extends Worker {
  constructor(services) {
    super(services, 'sass', true);
  }

  /**
   * Process the defined entry stylesheets with Node Sass.
   */
  async init() {
    const entries = this.services.FileSystem.getStack(this.name);

    if (!entries || !entries.length) {
      return;
    }

    // Create asyncronous compiler to process each entry in a parallel order.
    const compiler = entries.map(async entry => {
      await this.processEntry(entry);
    });

    // Run the compilers in parallel order.L0
    await Promise.all(compiler);

    /**
     * Output the encountered exceptions from initial entry files thrown by
     * the Sass compiler.
     */
    this.outputExceptions();

    // Resolve the Pending Contractor Promise for the initial worker.
    this.resolve();
  }

  /**
   * Process the defined Sass entry file.
   *
   * @param {Object} entry The defined FileSystem entry that will be processed.
   */
  processEntry(entry) {
    return new Promise(resolve => {
      log('Compiling entry stylesheet', entry.path);

      render(
        {
          file: entry.path,
          outputStyle: 'compact',
          importer: globImporter(),
          includePaths: [this.services.FileSystem.resolveSource()],
          outFile: this.services.FileSystem.resolveEntryPath(entry, '{name}.css'),
          sourceMap: this.services.Store.get('plains', 'devMode') || false,
        },
        async (exception, chunk) => {
          /**
           * Catch the exceptions of the rendered entry file in order to display
           * all errors at once.
           */
          if (exception) {
            this.exceptions.push({
              file: exception.file,
              line: exception.line,
              column: exception.column,
              message: exception.message,
            });
          } else {
            this.services.FileSystem.writeFiles(
              [entry, chunk.css, '{name}.css'],
              [entry, chunk.map, '{name}.css.map']
            ).then(() => {
              resolve();
            });
          }
        }
      );
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
        error(
          [`Error at: ${exception.file}:${exception.line}:${exception.column}`, exception.message],
          true
        );
      });

      if (this.services.Store.get('plains', 'devMode')) {
        warning('Done compiling, but encountered some errors.');
      } else {
        error(`Encountered some errors during compilation...`);
      }

      this.exceptions.sass = [];
    } else {
      success('Successfully compiled all stylesheets without any errors.');
    }
  }
}

module.exports = SassCompiler;
