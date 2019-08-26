const { existsSync, writeFile } = require('fs');
const { sync } = require('glob');
const { dirname, extname, join, parse, relative, resolve, sep } = require('path');
const mkdirp = require('mkdirp');
const { error, log, warning } = require('../Utils/Logger');
const { flatten } = require('../Utils/Tools');

/**
 * Utitlty to define and retreive the entry paths for the actual workers
 */
class Filesystem {
  constructor() {
    this.stacks = new Map();
    this.src = false;
    this.dist = false;
  }

  /**
   * Defines the root path for the FileSystem that will be used as working directory
   * in order to resolve entry files.
   * An exception will be thrown if the root path does not exists.
   *
   * @param {String} path The actual root path that will be used.
   */
  defineRoot(path) {
    if (!existsSync(path)) {
      error(`The given root path does not exists for: ${path}`);
    }

    this.src = resolve(path);
  }

  /**
   * Defines the destination directory where each entry will resolve to by
   * the Filesystem.
   *
   * The destination directory will be resolved relative to the path of the
   * working directory from the current Nodejs instance.
   *
   * @param {String} path The base path that will be resolved.
   */
  defineDestination(path) {
    if (path) {
      this.dist = resolve(path);

      // Create the destination folder if it doesn't exists yet.
      if (!existsSync(this.dist)) {
        log(`Creating destination folder: ${this.dist}`);

        mkdirp(this.dist)
      }
    }
  }

  /**
   * Returns the root path where all entry files should be stored.
   *
   * @returns {String} Returns the root path of the application.
   */
  getRoot() {
    if (!this.src) {
      error(`No root path has been defined for the Filesystem.`);
    }

    return this.src;
  }

  /**
   * Returns an Array with the subsribed entries within each stack or a specific
   * stack, if the stack argument exists within the Filesystem instance.
   *
   * @param {Array} stack Returns the actual stack collection if it exists;
   */
  source(stack) {
    let map = [];

    // Throw an Exception if the requested stack does not exists.
    if (stack && !this.hasStack(stack)) {
      error(`Stack: ${stack} does not exists within the Filesystem instance.`);
    }

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

    return map.filter(item => existsSync(item.path));
  }

  /**
   * Helper function to check if the given stack exists.
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
      warning(`Unable to create stack: ${stack}, it already exists within the Filesystem instance.`);

      return;
    }

    this.stacks.set(stack, []);
  }

  /**
   * Inserts a new entry into the given stack.
   *
   * @param {String} stack The name of the stack to insert defined the entry.
   * @param {String} entries The defined entry paths.
   * @param {String} extname Use the defined extname when writing the entry
   * to the actual destination. Use the entry extname if no value has been defined.
   */
  insertEntry(stack, entries, extname) {
    if (!this.hasStack(stack)) {
      return false;
    }

    // Ensure the entries can be iterated.
    const entryArray = Array.isArray(entries) ? entries : [entries];

    // Normalize the entry declerations and also include the entries with
    // a globbing pattern.
    const entryCollection = entryArray.map((entry) => {
      let initialEntry = entry;

      // Define the relative path of the actual entry.
      const relativeEntry = relative(process.cwd(), entry);

      // Define the relative path of the defined Filesystem source directory.
      const relativeSrc = relative(process.cwd(), this.src);

      // Ensure the Filesystem source path is within the entry.
      if (relativeEntry.indexOf(relativeSrc) === 0) {
        initialEntry = relativeEntry.replace(relativeSrc, '').replace(sep, '');
      }

      // Resolve the current entry path(s)
      const src = entry.indexOf('*') >= 0
        ? sync(resolve(this.src, initialEntry)).map(glob => resolve(glob))
        : [resolve(this.src, initialEntry)];

      return src;
    });

    // Define the actual destination for each each entry.
    const entrySubscriptions = flatten(entryCollection).map(src => {
      const dist = this.getEntryDestination(src, extname || false);

      const entrySubscription = {
        path: src,
        cwd: this.src,
        entry: relative(this.src, src),
        dist: join(this.dist, dirname(relative(this.src, src)))
      }

      return entrySubscription;
    });

    // Get the defined stack in order to merge the given entries.
    const initialStack = this.stacks.get(stack);

    // Ensure there are no duplicate entries defined for the stack.
    const newStack = entrySubscriptions
      .filter(entry => {
        if (!initialStack[entry] && existsSync(entry.path)) {
          return entry;
        }
        else if (initialStack[entry] && entry.path !== initialStack[entry].path && existsSync(entry.path)) {
          return entry

        }
      })
      .concat(initialStack);

    // Update the stack with the new entries.
    if (newStack.length > 0) {
      this.stacks.set(stack, newStack);
    }
  }

  /**
   * Writes the defined data to the common destination directory.
   * The destination directory should be defined when creating a new instance of
   * the Filesystem.
   *
   * @param {String} entry The path of the actual data source.
   * @param {Buffer} data The data source as Buffer.
   * @param {Object} options The options
   */
  write(entry, data, options) {
    // Define the destination path for the current entry.
    const destination = this.getEntryDestination(entry, options ? options.extname : false);

    return new Promise(cb => {
      mkdirp(dirname(destination), (err) => {
        if (err) {
          error(err);
        }

        writeFile(destination, data, (err) => {
          if (err) {
            error(err);
          }

          log(`Resource created: ${destination}`);

          cb();
        });
      });
    });
  }

  /**
   * Returns a destination path for the given entry.
   *
   * @param {String} entry Defines the destination for the current entry.
   * @param {String|Boolean} extension Adjusts the entry extension when writing
   * it as a destination entry.
   *
   * @returns Returns the resolved entry destination.
   */
  getEntryDestination(entry, extension) {
    if (!this.dist) {
      error([
        `Unable to define the destination for: ${entry}`,
        'There is no global destination path defined for the Filesystem service.',
        'You should define the destination path relative to the working directory of your Nodejs instance.'
      ]);
    }

    let relativeEntry = relative(this.src, entry);

    if (extension) {
      relativeEntry = relativeEntry.replace(extname(relativeEntry).replace('.', ''), extension);
    }

    return resolve(this.dist, relativeEntry);
  }
}

module.exports = Filesystem;
