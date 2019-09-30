const { transformFile } = require('@babel/core');

const Worker = require('./Worker');
const { error, log } = require('../Utils/Logger');

/**
 * Compiles the entry javascripts with Babel.
 */
class ScriptCompiler extends Worker {
  mount() {
    const mode = this.services.Store.get('argv', 'mode');

    this.services.FileSystem.source(this.name, (entry, resolve) => {
      log('Compiling script', entry);

      transformFile(
        entry,
        {
          presets: ['@babel/env'],
          sourceMaps: mode === 'development',
          envName: mode || 'production',
        },
        async (err, result) => {
          if (err) {
            error(err);
          }

          await this.services.FileSystem.writeFiles(
            [entry, result.code, '{name}.js'],
            [entry, result.map ? JSON.stringify(result.map, null, '\t') : null, '{name}.js.map']
          );

          // Resolve the iterated entry.
          resolve();
        }
      );
    }).then(() => {
      // Resolve the initial Worker if all entries have been processed.
      this.resolve();
    });
  }
}

module.exports = ScriptCompiler;
