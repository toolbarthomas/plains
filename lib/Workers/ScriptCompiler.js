const { transformFile } = require('@babel/core');

const Worker = require('./Worker');
const { error, log } = require('../Utils/Logger');

class ScriptCompiler extends Worker {
  constructor(services) {
    super(services, 'scripts', true);
  }

  async init() {
    const entries = this.services.FileSystem.getStack(this.name);
    const mode = this.services.Store.get('argv', 'mode');

    if (!entries || !entries.length) {
      return;
    }

    const queue = entries.map(
      entry =>
        new Promise(callback => {
          log('Transforming entry script', entry.path);

          transformFile(
            entry.path,
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

              return callback();
            }
          );
        })
    );

    await Promise.all(queue);

    this.resolve();
  }
}

module.exports = ScriptCompiler;
