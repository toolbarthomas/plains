const chokidar = require('chokidar');
const { extname, join } = require('path');

const Worker = require('./Worker');
const { log } = require('../Utils/Logger');

class Watcher extends Worker {
  constructor(services) {
    super(services);
    this.instances = {};
  }

  /**
   * Creates a chokidar instance for each defined FileSystem stack with a limited
   * lifecycle duration, the actual duration will reset for all instances if a
   * file known to the FileSystem updates.
   *
   * The Watcher task will resolve if all instances are closed.
   */
  async init() {
    const stacks = this.services.FileSystem.list();

    stacks.forEach(stack => {
      this.createInstance(stack);
    });
  }

  /**
   * Create a chokidar instance watcher from the selected worker instance.
   *
   * @param {String} name The name of the instance worker.
   */
  async createInstance(name) {
    if (!this.instances[name]) {
      this.instances[name] = {
        watcher: false,
        instance: null,
      };
    }

    const stack = this.services.FileSystem.getStack(name);
    if (!stack || !stack.length) {
      return;
    }

    this.services.FileSystem.source(
      name,
      entry => {
        const extensions = entry.map(path => extname(path));
        const directory = this.services.FileSystem.resolveEntryDirectory(entry);
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

        if (this.instances[name].instance) {
          clearTimeout(this.instances[name].instance);
          this.instances[name].watcher = false;
        }

        log('Creating Watcher instance', name);
        const watcher = chokidar.watch(
          glob,
          this.config && this.config[name] ? this.config[name] : {}
        );

        console.log(glob);

        this.instances[name].watcher = true;

        watcher.on('change', () => {
          console.log('change', name);
        });

        console.log(this.config.duration);

        this.instances[name].instance = setTimeout(() => {
          this.instances[name].watcher = false;
          log('Closing Watcher', name);
          watcher.close();
          this.resolve();
        }, this.config.duration);
      },
      true
    );
  }

  /**
   * Resolves the subscribed Contractor task if al wacther instances are closed.
   */
  resolve() {
    if (this.instances instanceof Object) {
      const active = Object.keys(this.instances).filter(name => {
        return this.instances[name].watcher === true;
      });

      console.log(active);

      if (!active.length) {
        super.resolve();
      }
    }
  }
}

module.exports = Watcher;
