const chokidar = require('chokidar');
const { extname, join } = require('path');

const Worker = require('./Worker');
const { flatten } = require('../Utils/Tools');
const { info, log } = require('../Utils/Logger');

class Watcher extends Worker {
  constructor(services) {
    super(services, 'development');

    // Object that holds all the watcher instances.
    this.instances = {};
    this.processing = false;
  }

  /**
   * Creates a chokidar instance for each defined FileSystem stack with a limited
   * lifecycle duration, the actual duration will reset for all instances if a
   * The task will resolve if all watcher instances are closed.
   */
  async init() {
    const stacks = this.services.FileSystem.list();

    // Create a new Watcher instance for each created stack.
    if (this.instances instanceof Object && Object.keys(this.instances).length === 0) {
      stacks.forEach(stack => {
        this.createInstance(stack);
      });
    }

    if (this.instances instanceof Object && Object.keys(this.instances).length > 0) {
      info('Watcher initiated, observing files...');
    }
  }

  /**
   * Create a Watcher with chokidar for the defined FileSystem stack.
   *
   * @param {String} name The name of the instance worker to define the Watcher
   * instance from.
   */
  async createInstance(name) {
    const workerConfiguration = this.services.Store.get('plains', 'workers');

    if (name === this.name || !workerConfiguration[name] || !workerConfiguration[name].watch) {
      return;
    }

    // Only proceed if there are any entry files defined for the initial stack.
    const stack = flatten(this.services.FileSystem.getStack(name));
    if (!stack || !stack.length) {
      return;
    }

    if (!this.instances[name] || !(this.instance[name] instanceof Object)) {
      // Prepare a new Watcher instance for the defined stack.
      this.instances[name] = {
        watcher: null,
        instance: null,
      };
    }

    // Define all filetypes that should be watcher by the instance.
    const extensions = stack.map(path => extname(path));

    // Define the root directory where the watcher instance should observe from.
    const directory = this.services.FileSystem.resolveEntryDirectory(stack);

    // Define the actual glob pattern.
    let glob = join(directory, '**/*');
    extensions.forEach((path, index) => {
      if (index === 0) {
        glob += '.{';
      }
      if (index === extensions.indexOf(path)) {
        if (index > 0) {
          glob += `,${path.replace('.', '')}`;
        } else {
          glob += path.replace('.', '');
        }
      }
      if (index === extensions.length - 1) {
        glob += '}';
      }
    });

    // Define the Watch Event Listeners for the current instance.
    this.spawnInstance(name, glob);

    // Define a limited lifecycle for the current instance.
    this.defineInstanceLifeCycle(name);
  }

  /**
   * Creates a new Chokidar instance for the defined worker name if it doesn't
   * exist yet.
   *
   * @param {String} name Spawns the instance within the defined worker instance name.
   * @param {String} glob The entry path for the wachter instance.
   */
  spawnInstance(name, glob) {
    if (!this.instances[name]) {
      return;
    }

    /**
     * Assign the Watcher if it
     */
    if (!this.instances[name].watcher) {
      log('Creating Watcher instance', name);

      this.instances[name].watcher = chokidar.watch(
        glob,
        this.config[this.name] && this.config[this.name].chokidarOptions
          ? this.config[this.name].chokidarOptions
          : {}
      );

      /**
       * Assign the change Event to the defined Watcher
       */
      this.instances[name].watcher.on('change', async path => {
        log('File changed', path);

        Object.keys(this.instances).forEach(instanceName => {
          this.defineInstanceLifeCycle(instanceName);
        });

        // Await the previous Contractor batch before initiating another process.
        if (this.processing) {
          return;
        }

        /**
         * Get the subscribed Contractor task that have the defined worker
         * assigned to it.
         */
        const task = this.services.Contractor.getTaskFromWorkerInstance(name);
        this.services.Contractor.defineTaskQueue(task.filter(item => item !== this.config.task));

        this.processing = true;

        // Prevent the Watcher to initiate Contractor simultaneous.
        setTimeout(() => {
          this.processing = false;
        }, 500);

        await this.services.Contractor.run();

        // Enable Watcher emitted Events.
        this.processing = false;

        info('Resuming Watcher...');
      });
    }
  }

  /**
   * Defines the lifecycle of the initial Watcher instance, this removes
   * the Chokidar watch events if there has been no activity within a certain
   * amount of time.
   *
   * @param {String} name Defines the lifecycle for the given instance name if
   * it exists.
   */
  defineInstanceLifeCycle(name) {
    if (this.instances[name] && this.instances[name].autoclose) {
      log('Reset Watcher instance', name);
      clearTimeout(this.instances[name].autoclose);
    } else {
      log('Define Watcher lifecycle', name);
    }

    this.instances[name].autoclose = setTimeout(() => {
      this.closeWatcher(name);
    }, this.config.duration);
  }

  /**
   * Removes al defined watch events within the initial Watcher instance.
   *
   * @param {String} name Removes the watch events from initial Watcher.
   */
  closeWatcher(name) {
    if (this.instances[name] && this.instances[name].watcher) {
      log('Closing Watcher instance', name);
      this.instances[name].watcher.close();
      this.instances[name].watcher = null;
      this.resolve();
    }
  }

  /**
   * Resolves the initial Worker if all Chokidar watch instances are closed.
   */
  resolve() {
    const trigger = Object.keys(this.instances).filter(name => {
      const instance = this.instances[name];
      return instance.watcher != null;
    });

    if (!trigger || trigger.length === 0) {
      log('Closed all Watcher instances.');
      super.resolve();
    }
  }
}

module.exports = Watcher;
