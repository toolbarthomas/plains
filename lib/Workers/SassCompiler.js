const { render } = require('node-sass');
const globImporter = require('node-sass-glob-importer');

const Worker = require('./Worker');
const { error, log, warning, success } = require('../Utils/Logger');

class SassCompiler extends Worker {
  constructor(services) {
    super(services, 'sass', true);
    this.exceptions = [];
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
    const queue = entries.map(
      entry =>
        new Promise(callback => {
          log('Compiling entry stylesheet', entry.path);

          render(
            {
              file: entry.path,
              outputStyle: 'compact',
              importer: globImporter(),
              includePaths: [this.services.FileSystem.resolveSource()],
              outFile: this.services.FileSystem.resolveEntryPath(entry, '{name}.css'),
              sourceMap: this.services.Store.get('argv', 'mode') === 'development',
            },
            async (exception, result) => {
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
                await this.services.FileSystem.writeFiles(
                  [entry, result.css, '{name}.css'],
                  [entry, result.map, '{name}.css.map']
                );
              }

              return callback();
            }
          );
        })
    );

    // Run the compilers in parallel order.L0
    await Promise.all(queue);

    /**
     * Output the encountered exceptions from initial entry files thrown by
     * the Sass compiler.
     */
    this.outputExceptions();

    // Resolve the Pending Contractor Promise for the initial worker.
    this.resolve();
  }

  /**
   * Output the encountered Errors of Node Sass.
   */
  outputExceptions() {
    // Notify the user about the Compiler errors.
    if (this.exceptions && this.exceptions.length) {
      // Output the encountered syntax errors.
      this.exceptions.forEach(exception => {
        error(
          [`Error at: ${exception.file}:${exception.line}:${exception.column}`, exception.message],
          true
        );
      });

      if (this.services.Store.get('argv', 'mode') === 'development') {
        warning('Done compiling, but encountered some errors.');
      } else {
        error(`Encountered some errors during compilation...`);
      }

      this.exceptions = [];
    } else {
      success('Successfully compiled all stylesheets without any errors.');
    }
  }
}

module.exports = SassCompiler;
