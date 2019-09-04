const chokidar = require('chokidar');
const { error, log } = require('../Utils/Logger');

class Watcher {
  constructor(services) {
    this.services = services;
    this.watchers = {};
    this.tasks = false;
  }

  /**
   * Creates a Watcher instance for each stack that has been defined
   * to the Filesystem service.
   */
  mount() {
    // Get the list of the running Contractor tasks.
    this.tasks = this.services.Contractor.getTaskQueue();

    const stacks = this.services.Filesystem.list();

    if (!stacks || !stacks.length) {
      warning('No stacks where defined by the Filesystem to Watch.');
      return;
    }

    // Define the actual instance for each task.
    stacks.forEach(stack => {
      if (this.watchers[stack] && this.watchers[stack] instanceof Object) {
        error(`The Watcher plugin already has been defined for ${stack}`)
      }

      this.watchers[stack] = {
        // The actual chokidar instance for the current Filesystem stack.
        instance: null,

        // Defines a delay before the Watcher instance calls the defined task
        // after a watchevent has been triggered.
        delay: null,

        // Defines a timer for the current instance that will close the
        // Watcher if there was no activity within the defined period.
        timer: null,
      };
    });
  }

  /**
   * Intiate the Watcher instance for defined Contractor task.
   */
  run() {
    if (!this.tasks) {
      return;
    }

    this.tasks.forEach(task => {
      if (!this.watchers[task]) {
        return;
      }

      const entries = this.services.Filesystem.getStackDirectories(task);

      // Create the intial Watcher.
      this.watchers[task].instance = chokidar.watch(entries, {
        ignored: /(^|[\/\\])\../
      });


      this.watchers[task].instance.on('all', (stats, path) => {
        this.resetDelay(task);
        this.resetTimer(task);

        log(`Entry updated (${stats})`, path);

        this.watchers[task].timer = setTimeout(async () => {
          this.watchers[task].instance.close();
        }, 10000);

        this.watchers[task].delay = setTimeout(async () => {
          await this.services.Contractor.publish(task);
        }, 100);
      });
    });
  }

  /**
   * Clears the active delay for defined Wachter instance.
   *
   * @param {String} task Clears the delay for the defined task.
   */
  resetDelay(task) {
    if (this.watchers[task] && this.watchers[task].delay) {
      clearTimeout(this.watchers[task].delay);
    }
  }

  /**
   *
   */
  defineDelay(task) {
    if (this.watchers[task]) {

    }
  }

  /**
   * Clears the active timer for defined Wachter instance.
   *
   * @param {String} task Clears the timer for the defined task.
   */
  resetTimer(task) {
    if (this.watchers[task] && this.watchers[task].timer) {
      clearTimeout(this.watchers[task].timer);
    }
  }
}

module.exports = Watcher;
