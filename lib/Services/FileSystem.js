const { copyFile, existsSync, writeFile, statSync } = require('fs');
const { sync } = require('glob');
const { basename, dirname, extname, join, relative, resolve, sep } = require('path');
const mkdirp = require('mkdirp');
const { error, log, warning } = require('../Utils/Logger');

/**
 * Utitlty to define and retreive the entry paths for the actual workers
 */
class FileSystem {
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
  defineSource(path) {
    if (!existsSync(path)) {
      error(`The given root path does not exists: ${path}`);
    }

    this.src = resolve(path);
  }

  /**
   * Returns the root path where all entry files should be stored.
   *
   * @returns {String} Returns the root path of the application.
   */
  resolveSource() {
    if (!this.src) {
      error(`No root path has been defined for the FileSystem.`);
    }

    return this.src;
  }

  /**
   * Defines the destination directory where each entry will resolve to by
   * the FileSystem.
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

        mkdirp(this.dist);
      }
    }
  }

  /**
   * Returns the base destination directory.
   *
   * @returns {String} Returns the destination path of the dist directory.
   */
  resolveDestination() {
    if (!this.dist) {
      error([
        'There is no global destination path defined for the FileSystem service.',
        'You should define the destination path relative to the working directory of the running instance.',
      ]);
    }

    return this.dist;
  }

  /**
   * Creates the defined stack if it hasn't been created yet.
   *
   * @param {String} stack The name of the stack to create.
   */
  createStack(stack) {
    if (this.hasStack(stack)) {
      warning(`${stack} has already been created by the FileSystem.`);

      return;
    }

    log('FileSystem stack created', stack);

    this.stacks.set(stack, []);
  }

  /**
   * Returns an array with all subscribed stack names.
   */
  list() {
    return [...this.stacks.keys()];
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
   * Return the subsribed stack entries within each stack or a specific
   * stack, if the stack argument exists within the FileSystem instance.
   *
   * @param {String} name Return the stack of a stack exists with the defined name;
   *
   * @returns {Array} Array with al the inserted entry collections.
   */
  getStack(name) {
    // Throw an Exception if the requested stack does not exists.
    if (name && !this.hasStack(name)) {
      error(`Stack: ${name} does not exists within the FileSystem instance.`);
    }

    return this.stacks.get(name);
  }

  /**
   * Inserts a new entry into the given stack.
   *
   * @param {String} stack The name of the stack to insert defined the entry.
   * @param {String|Array} entry The entry or entries to resolve by the
   * FileSystem.
   *
   * @returns Returns the inserted paths if the exists or false if no false have been inserted.
   */
  insertEntry(stack, entry) {
    if (!entry) {
      return false;
    }

    if (!this.hasStack(stack)) {
      error(`Stack ${stack} does not exists.`);
    }

    // Ensure multiple entry points can be defined by the configuration.
    const queue = this.createEntryQueue(entry);

    if (!queue || !queue.length) {
      warning([
        `Skipping entry definition for ${stack}`,
        `No source has been defined for ${stack}...`,
      ]);

      return false;
    }

    log('Assigning entry files for', stack);

    // Ensure the given entry paths actually exists.
    const filteredStack = queue.map(cwd =>
      cwd
        .filter((path, index) => cwd.indexOf(path) === index)
        .filter(path => existsSync(path) && !statSync(path).isDirectory())
    );

    // Combine the new entries with the already defined stack.
    const initialStack = this.stacks.get(stack);
    const newStack = initialStack.concat(filteredStack);

    this.stacks.set(stack, newStack);

    // Expose the updated stack.
    return newStack;
  }

  /**
   * Converts the defined entry to an Array to ensure the FileSystem can create
   * multiple working directories for each worker.
   *
   * @param {String|Array} entry The entry pattern to queue.
   */
  createEntryQueue(entry) {
    if (!entry) {
      return null;
    }

    // Create new Array that will be the base of the FileSystem entry array.
    const queue = [];
    // Define a new working directory if the given entry is a single string.
    if (typeof entry === 'string') {
      /**
       * Sync the defined entries directly if it's an actual globbing pattern.
       * Push the single string value in the normalizedEntries array if it's
       * a simple string without wildcards.
       */
      if (entry.indexOf('*') >= 0) {
        queue.push(sync(this.resolveEntrySource(entry)));
      } else {
        queue.push([this.resolveEntrySource(entry)]);
      }
    } else if (Array.isArray(entry)) {
      const subEntry = [];

      entry.forEach(initialEntry => {
        if (typeof initialEntry === 'string') {
          if (initialEntry.indexOf('*') >= 0) {
            queue.push(sync(this.resolveEntrySource(initialEntry)));
          } else {
            subEntry.push(this.resolveEntrySource(initialEntry));
          }
        } else if (Array.isArray(initialEntry)) {
          queue.push(initialEntry.map(c => this.resolveEntrySource(c)));
        }
      });

      if (subEntry && subEntry.length) {
        queue.push(subEntry);
      }
    }

    return queue;
  }

  /**
   * Resolve the source path of the defined entry.
   */
  resolveEntrySource(entry) {
    let entrySource = entry;
    const relativeEntry = relative(process.cwd(), entry);
    const cwd = relative(process.cwd(), this.src);

    if (relativeEntry.indexOf(cwd) === 0) {
      entrySource = relativeEntry.replace(cwd, '').replace(sep, '');
    }

    return resolve(this.src, entrySource);
  }

  /**
   * Resolves the destination path of the defined entry with the option
   * to define an alternative filename for the destination path.
   *
   * @param {String} entry The path of the current entry.
   * @param {String} filename The optional filename to use within the resolve.
   */
  resolveEntryDestination(entry, filename) {
    const file = filename
      ? filename.replace('{name}', basename(entry, extname(entry)))
      : basename(entry);

    const directory = dirname(relative(this.src, entry));

    return join(this.dist, directory, file);
  }

  /**
   * Iterator that exposes a Promise Object for each collection within
   * defined stack.
   *
   * @param {String} name The stack to iterate trough.
   * @param {Function} handler The function to use within each iteration.
   * @param {Boolean} preserve Iterates within the collections instead
   * of the children within each collection when TRUE.
   */
  async source(name, handler, preserve) {
    if (!name) {
      error('Unable source for stack, no stack has been defined to source');
    }

    if (typeof handler !== 'function') {
      error('The handler arguments must be function');
    }

    const stack = this.getStack(name);

    // Queue a Promise Object for each entry collection for the defined stack.
    const queue = [];

    // Define the actual Promise for each entry.
    stack.forEach(collection => {
      if (preserve) {
        queue.push(
          new Promise((callback, reject) => {
            handler(collection, callback, reject);
          })
        );
      } else {
        collection.forEach(entry => {
          queue.push(
            new Promise((callback, reject) => {
              handler(entry, callback, reject);
            })
          );
        });
      }
    });

    if (!queue.length) {
      warning(`No entry files where found within stack: ${name}.`);

      return Promise.resolve();

      // queue.push(
      //   // new Promise((callback, reject) => {
      //   //   handler(null, callback, reject);
      //   // })

      //   return
      // );
    }

    return Promise.all(queue);
  }

  /**
   * Copies the defined entry paths to the common destination directory.
   */
  copy(entry) {
    return new Promise((callback, reject) => {
      if (!entry) {
        error('No entry has been defined to duplicate');
      }

      if (!existsSync(entry)) {
        error('Unable to duplicate entry, it does not exists');
      }

      const destination = this.resolveEntryDestination(entry);

      if (existsSync(destination)) {
        warning(`Entry has already been duplicated: ${destination}`);
        callback();
      } else {
        mkdirp(dirname(destination), async err => {
          if (err) {
            error(err);
          }

          await copyFile(entry, destination, err2 => {
            if (err2) {
              error(err2);
            }

            log('Entry duplicated', destination);

            callback();
          });
        });
      }
    });
  }

  /**
   * Writes the defined data to the common destination directory.
   * The destination directory should be defined when creating a new instance of
   * the FileSystem.
   *
   * @param {Object} entry The defined entry that will be used.
   * @param {Buffer} data The data source as Buffer.
   * @param {Object} options The options
   */
  writeFile(entry, data, name) {
    // Define the destination path for the current entry.
    const resourceDestination = this.resolveEntryDestination(entry, name);

    return new Promise(callback => {
      if (!data) {
        log('Skipping empty resource', resourceDestination);

        callback();
      } else {
        mkdirp(dirname(resourceDestination), err => {
          if (err) {
            error(err);
          }

          log('Creating resource', resourceDestination);

          writeFile(resourceDestination, data, err2 => {
            if (err2) {
              error(err2);
            }

            log('Resource created', resourceDestination);

            callback();
          });
        });
      }
    });
  }

  /**
   * Method to write the defined items array in an asynchronous order.
   * You can call to actual writeFile method directly within the
   * items argument or just pas down the arguments from the initiaed writeFile
   * method.
   *
   * @param  {...any} items The defined items that should be created
   * by the FileSystem.
   *
   */
  async writeFiles(...items) {
    const queue = items.map(item => {
      if (typeof item === 'function') {
        return item;
      }

      if (Array.isArray(item)) {
        return this.writeFile(item[0], item[1], item[2]);
      }

      if (item instanceof Object) {
        return this.writeFile(item.entry, item.data, item.name);
      }

      return null;
    });

    await Promise.all(queue);
  }
}

module.exports = FileSystem;
