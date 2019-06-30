class Filesystem {
  constructor() {
    this.stacks = new Map();
  }

  source() {
    return this.stacks;
  }

  hasStack(stack) {
    return stack && this.stacks.has(stack);
  }

  createStack(stack) {
    if (this.hasStack(stack)) {
      return;
    }

    this.stacks.set(stack, []);
  }

  insertEntry(stack, path) {
    const map = this.stacks
      .get(stack)
      .filter(entry => entry !== path)
      .concat(path);

    this.stacks.set(stack, map);
  }
}

module.exports = Filesystem;
