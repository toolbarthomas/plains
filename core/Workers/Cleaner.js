const rimraf = require('rimraf');

class Cleaner {
  constructor(services) {
    this.services = services;
    this.taskName = 'clean';
  }

  mount() {
    this.services.Contractor.subscribe(this.taskName, this.init.bind(this), true);
  }

  init() {
    this.services.Filesystem.createStack('sass');

    this.services.Filesystem.insertEntry('sass', './index.scss');
    this.services.Filesystem.insertEntry('sass', './foo.scss');

    const stacks = this.services.Filesystem.source();

    let stackCompleted = 0;

    stacks.forEach((stack, name) => {
      let queue = 0;

      console.log('Stack');

      stack.forEach(entry => {
        rimraf(entry, () => {
          queue += 1;

          if (queue >= stack.length) {
            stackCompleted += 1;
          }

          if (stackCompleted >= stacks.size) {
            this.services.Contractor.resolve(this.taskName);
          }
        });
        // rimraf(entry, () => {
        //   queue += 1;

        //   if (queue >= stack.length) {
        //     stackCompleted += 1;
        //   }

        //   if (stackCompleted >= stacks.length) {
        //     resolve();
        //   }
        // });
      });
    });
  }
}

module.exports = Cleaner;
