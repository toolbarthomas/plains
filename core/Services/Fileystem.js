const { existsSync } = require('fs');
const { sync } = require('glob');
const { resolve } = require('path');

/**
 * Utitlty to define and retreive the entry paths for the actual workers
 */
class Filesystem {
  constructor() {
    this.stacks = new Map();
  }

  /**
   * Returns an Array with all subsribed paths within each stack or a specific
   * stack if the stack paramater matches within the stacks object.
   *
   * @param {String|Array} stack Returns the specified stack if it exists.
   */
  source(stack) {
    let map = [];

    if (stack && this.hasStack(stack)) {
      const entries = this.stacks.get(stack);

      entries.forEach(entry => {
        map = map.filter(item => entry !== item).concat(entry);
      });
    } else {
      this.stacks.forEach(entries => {
        entries.forEach(entry => {
          map = map.filter(item => entry !== item).concat(entry);
        });
      });
    }

    return map.filter(item => existsSync(item));
  }

  /**
   * Check if the stack if defined.
   *
   * @param {String} stack The stack to check for existance.
   */
  hasStack(stack) {
    return stack && this.stacks.has(stack);
  }

  /**
   * Creates the defined stack if it hasn't been created yet.
   *
   * @param {String} stack The name of the stack to create.
   */
  createStack(stack) {
    if (this.hasStack(stack)) {
      return;
    }

    this.stacks.set(stack, []);
  }

  /**
   * Inserts a new entry into the given stack.
   *
   * @param {String} stack The name of the stack to insert defined the entry.
   * @param {String} entries The defined entry paths.
   *
   * @returns {Array|Boolean} Returns the entries of the updated stack or false
   * if the actual stack has not been updated.
   */
  insertEntry(stack, entries) {
    if (!this.hasStack(stack)) {
      return false;
    }

    // Make sure the paths are within an Array before it will be resolved.
    const entryPaths = [];

    if (Array.isArray(entries)) {
      entries.forEach(entry => {
        entryPaths.push(entry);
      });
    } else {
      entryPaths.push(entries);
    }

    // Resolve the new entries before it will be inserted within the
    let resolvedPaths = [];
    entryPaths.forEach(path => {
      if (path.indexOf('*') >= 0) {
        resolvedPaths = resolvedPaths.concat(sync(path).map(globPath => resolve(globPath)));
      } else {
        resolvedPaths = resolvedPaths.concat(resolve(path));
      }
    });

    // Get the defined stack in order to merge the given entries.
    const initialStack = this.stacks.get(stack);

    // Make sure only new entries are inserted within the stack.
    const transformedStack = resolvedPaths
      .filter(path => path !== initialStack[path] && existsSync(path))
      .concat(initialStack);

    // Update the stack with the new paths.
    if (transformedStack.length > 0) {
      this.stacks.set(stack, transformedStack);

      // Return the updated stack if the stack has been updated.
      return this.source(stack);
    }

    // Return false if the defined stack has not been updated.
    return false;
  }
}

module.exports = Filesystem;
