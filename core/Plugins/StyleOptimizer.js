class StyleOptimizer {
  constructor(services) {
    this.services = services;
    this.stacks;

    this.foo = 'bar';
  }

  mount() {
    this.services.Contractor.subscribePlugin('sass', 'styleOptimizer', this.run.bind(this));
  }

  run() {
    const stack = this.services.Filesystem.getStack('sass');

    console.log(stack);

    // if (!this.stacks || !this.stacks.length) {
    //   return;
    // }

    // this.stacks.forEach(stack => {
    //   console.log(stack);
    // });
  }
}

module.exports = StyleOptimizer;
