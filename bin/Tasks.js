const { error, success } = require('./Common/Logger');

class Tasks {
  constructor(args) {
    this.args = args;

    // Stores the registered tasks.
    this.instances = {};
  }

  /**
   *
   * @param {*} name
   */
  define(name) {
    if (this.instances[name]) {
      error(`Task '${name} is already defined.'`);
    } else {
      this.instances[name] = new Promise((resolve, reject) => {
        console.log('Running');

        resolve();
      });
    }
  }

  async run(name) {
    if (!this.instances[name] || typeof this.instances[name] !== 'function') {
      error(`Task '${name} is not defined.'`);
    }

    info(`Running task ${name}...`);

    await this.instances[name]().then((err) => {
      if (err) {
        error(err);
      }

      success(`Done - ${name}`);
    });
  }
}

module.exports = Tasks;
