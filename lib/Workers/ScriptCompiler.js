const { transformFile } = require('@babel/core');

const Worker = require('./Worker');
const { error, log } = require('../Utils/Logger');

class ScriptCompiler extends Worker {
  constructor(services) {
    super(services, 'scripts', true);
  }

  async init() {
    const mode = this.services.Store.get('argv', 'mode');

    await this.services.FileSystem.source(this.name, (entry, resolve) => {
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

          resolve();
        }
      );
    });

    this.resolve();
  }
}

module.exports = ScriptCompiler;
