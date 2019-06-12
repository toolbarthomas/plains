const { error, info, success } = require('./Common/Logger');

class Builder {
  constructor(Argv, Environment, Config, Store, Tasks) {
    this.Argv = Argv;
    this.Environment = Environment;
    this.Config = Config;
    this.Store = Store;
    this.tasks = {};
  }

  /**
   * Check if the given task has been defined.
   *
   * @param {String} task The name of task to check for existence.
   */
  hasTask(task) {
    return typeof this.tasks[task] === 'function';
  }

  defineTasks() {
    let task = this.Argv.args ? this.Argv.args.task : false;

    // Make sure that the task argument doesn't end with a comma.
    if (String(task).endsWith(',')) {
      task = task.substring(0, task.length - 1);
    }

    // Check if multiple tasks are defined.
    if (task.indexOf(',') >= 0) {
      return task.split(',').map(t => t.trim());
    }

    return task.length ? [task] : ['default'];
  }

  run() {
    return new Promise(async (resolve, reject) => {
      const tasks = this.defineTasks();

      // eslint-disable-next-line no-restricted-syntax
      for (const task of tasks) {
        if (typeof this[task] === 'function') {
          info(`Running tasks: ${task}`);

          /* eslint-disable-next-line no-await-in-loop */
          await this[task]();

          success(`Done - ${task}`);
        } else {
          error(`Task '${task} is not defined.'`);
        }
      }
    });
  }

  foo() {
    console.log('Foo');
  }
}

module.exports = Builder;
