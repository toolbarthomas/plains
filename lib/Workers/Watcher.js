const chokidar = require('chokidar');
const { extname, join } = require('path');

const Worker = require('./Worker');
const { info, log } = require('../Helpers/Logger');

class Watcher extends Worker {
  constructor(services) {
    super(services);

    this.sources = {};
    this.isActive = false;
  }

  /**
   * Prepares the Watcher by creating a chokidar instance that will be called
   * when the actual worker starts.
   */
  async start() {
    const collection = this.services.Filesystem.list().filter(
      name => name !== this.name
    );

    if (!collection) {
      return;
    }

    if (!this.hasSourcesAssigned()) {
      collection.forEach(name => this.assignSource(name));
    }

    if (this.hasSourcesAssigned()) {
      info('Watcher initiated, observering files...');
    }
  }

  /**
   * Checks if the current Watcher instance has a source defined within it's
   * sources property.
   *
   * @returns {Boolean} Returns true if the source exists within the sources
   * property.
   */
  hasSourcesAssigned() {
    return this.sources instanceof Object && Object.keys(this.sources).length;
  }

  /**
   * Assigns the defined Filesystem instance to the Watcher sources object.
   *
   * @param {String} name The instance to use from the the Filesystem.
   */
  async assignSource(name) {
    const { workers } = this.services.Store.use('config');

    if (!workers || !workers[name] || this.sources[name]) {
      return;
    }

    if (!this.sources[name]) {
      this.sources[name] = {
        watcher: null,
        instance: null,
      };
    }

    const config = workers[name];
    const paths = this.services.Filesystem.source(name);

    const filetypes = paths.map(path => extname(path));
    const cwd = this.services.Filesystem.resolveInstance(paths);

    // Define the actual glob pattern.
    let glob = join(cwd, '**/*');
    filetypes.forEach((path, index) => {
      if (index === 0) {
        glob += '.{';
      }
      if (index === filetypes.indexOf(path)) {
        if (index > 0) {
          glob += `,${path.replace('.', '')}`;
        } else {
          glob += path.replace('.', '');
        }
      }
      if (index === filetypes.length - 1) {
        glob += '}';
      }
    });

    this.spawn(name, glob, config);

    this.defineInstanceLifecycle(name);
  }

  /**
   * Creates a new Chokidar instance and assign it to the sources object of the
   * Watcher.
   */
  spawn(name, glob, config) {
    if (!this.sources[name]) {
      return;
    }

    if (this.sources[name].watcher) {
      return;
    }

    // Create the actual chokidar instance.
    this.sources[name].watcher = chokidar.watch(
      glob,
      config && config.chokidarOptions ? config.chokidarOptions : {}
    );

    this.sources[name].watcher.on('change', async path => {
      log('File changed', path);

      Object.keys(this.sources).forEach(source =>
        this.defineInstanceLifecycle(source)
      );

      // Await the previous Contractor batch before initiating another process.
      if (this.isActive) {
        return;
      }

      this.isActive = true;

      // Prevent the Watcher to initiate Contractor simultaneous.
      setTimeout(() => {
        this.isActive = false;
      }, 500);

      await this.services.Contractor.publish(
        this.services.Contractor.hook(name)
      );

      this.isActive = false;

      info('Resuming watcher');
    });
  }

  /**
   * Closes the initial chokidar instance and removes all the defined events.
   *
   * @param {String} name The source that will be closed by the Watcher.
   */
  close(name) {
    if (this.sources[name] && this.sources[name].watcher) {
      log('Closing Watcher instance', name);
      this.sources[name].watcher.close();
      this.sources[name].watcher = null;
      this.resolve();
    }
  }

  /**
   * Defines the lifecycle for the defined Watcher instance, this removes
   * the Chokidar watch events if there has been no activity within a certain
   * amount of time.
   *
   * @param {String} name Defines the lifecycle for the given instance name if
   * it exists.
   */
  defineInstanceLifecycle(name) {
    if (!this.sources[name]) {
      error(
        'Unable to define a Watcher lifecyle for ${name} since it does not exists.'
      );
    }

    if (this.sources[name] && this.sources[name].autoclose) {
      log('Reset Watcher instance', name);
      clearTimeout(this.sources[name].autoclose);
    } else {
      log('Define Watcher lifecycle', name);
    }

    this.sources[name].autoclose = setTimeout(() => {
      log('Watcher expired', name);
      this.close(name);
    }, this.config.duration);
  }

  /**
   * Resolves the initial Worker if all Chokidar watch instances are closed.
   */
  resolve() {
    const trigger = Object.keys(this.sources).filter(name => {
      const instance = this.sources[name];
      return instance.watcher != null;
    });

    if (!trigger || trigger.length === 0) {
      super.resolve();
    }
  }
}

module.exports = Watcher;
