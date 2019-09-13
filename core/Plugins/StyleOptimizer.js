class StyleOptimizer {
  constructor(services) {
    this.services = services;
    this.stacks;

    this.foo = 'bar';
  }

  mount() {
    // Assign the actual plugin to the task queue.
    this.services.Contractor.assignPlugin('StyleOptimizer', 'sass', this.run.bind(this));
  }

  run() {
    const directories = this.services.Filesystem.resolveStackDirectories('sass');

    console.log(directories);
  }
}

module.exports = StyleOptimizer;
