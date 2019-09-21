const { render } = require('node-sass');
const globImporter = require('node-sass-glob-importer');

const Worker = require('./Worker');
const { error, log, warning, success } = require('../Utils/Logger');

/**
 * Compiles the entry stylesheets with Node Sass.
 */
class StyleCompiler extends Worker {
  constructor(services) {
    super(services, 'styles', true);
    this.exceptions = [];
  }

  init() {
    this.services.FileSystem.source(this.name, (entry, resolve) => {
      log('Compiling stylesheet', entry);

      render(
        {
          file: entry,
          outputStyle: 'compact',
          importer: globImporter(),
          includePaths: [this.services.FileSystem.resolveSource()],
          outFile: this.services.FileSystem.resolveEntryDestination(entry, '{name}.css'),
          sourceMap: this.services.Store.get('argv', 'mode') === 'development',
        },
        async (exception, result) => {
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

          // Resolve the iterated entry.
          resolve();
        }
      );
    }).then(() => {
      /**
       * Output the encountered exceptions thrown by the Sass compiler for
       * for each entry file.
       */
      this.outputExceptions();

      // Resolve the initial Worker if all entry definitions have been processed.
      this.resolve();
    });
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
    }
  }
}

module.exports = StyleCompiler;
