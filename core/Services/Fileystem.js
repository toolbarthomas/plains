const { existsSync, writeFile } = require('fs');
const { sync } = require('glob');
const { basename, dirname, extname, join, parse, relative, resolve, sep } = require('path');
const mkdirp = require('mkdirp');
const { error, log, warning, success } = require('../Utils/Logger');
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
  resolveSource() {
    if (!this.src) {
      error(`No root path has been defined for the Filesystem.`);
    }

    return this.src;
  }

  /**
   * Returns the destination path where all entry file will be written to.
   *
   * @returns {String} Returns the destination path of dist directory.
   */
  resolveDestination() {
    if (!this.dist) {
      error([
        `Unable to define the destination for: ${path}`,
        'There is no global destination path defined for the Filesystem service.',
        'You should define the destination path relative to the working directory of your Nodejs instance.'
      ]);
    }

    return this.dist;
  }

  /**
   * Return the subsribed stack entries within each stack or a specific
   * stack, if the stack argument exists within the Filesystem instance.
   *
   * @param {String} stack Returns the actual stack collection if it exists;
   *
   * @returns {Object} The selected Stack with all the defined entries.
   */
  source(stack) {
    let map = {};

    // Throw an Exception if the requested stack does not exists.
    if (stack && !this.hasStack(stack)) {
      error(`Stack: ${stack} does not exists within the Filesystem instance.`);
    }

    if (stack) {
      map[stack] = this.stacks.get(stack).filter(item => (item instanceof Object) && existsSync(item.path))
      // entries.forEach(entry => {
      //   map = map.filter(item => entry !== item).concat(entry);
      // });
    } else {
      this.stacks.forEach((value, key) => {
        map[key] = value.filter(item => (item instanceof Object) && existsSync(item.path));
      });
    }

    return map;
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
   */
  insertEntry(stack, entries) {
    if (!this.hasStack(stack) || !entries) {
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
      return {
        path: src,
        cwd: this.src,
        entry: relative(this.src, src),
        dist: this.resolveEntryDestination(src),
      }
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
   * @param {Object} entry The defined entry that will be used.
   * @param {Buffer} data The data source as Buffer.
   * @param {Object} options The options
   */
  writeFile(entry, data, name) {
    // Define the destination path for the current entry.
    const resourceDestination = this.resolveEntryPath(entry, name);

    return new Promise(cb => {
      if (!data) {
        log('Skipping empty resource', resourceDestination);

        cb();
      } else {
        mkdirp(dirname(resourceDestination), (err) => {
          if (err) {
            error(err);
          }

          log('Creating resource', resourceDestination);

          writeFile(resourceDestination, data, (err) => {
            if (err) {
              error(err);
            }

            success(`Resource created: ${resourceDestination}`);

            cb();
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
   * @param  {...Function|Object} items The defined items that should be created
   * by the Filesystem.
   *
   */
  async writeFiles(...items) {
    const queue = items.map(item => {
      if (typeof item === 'function') {
        return item;
      } else if (Array.isArray(item)) {
        return this.writeFile(
          item[0],
          item[1],
          item[2]
        )
      } else if (item instanceof Object) {
        return this.writeFile(
          item.entry,
          item.data,
          item.name
        )
      }
    });

    await Promise.all(queue);
  }

  /**
   * Resolves the destination directory path for the defined source.
   *
   * @param {String} path Defines the destination for the current entry.
   *
   * @returns Returns the dirname for the defined entry source.
   */
  resolveEntryDestination(path) {
    return join(this.resolveDestination(), dirname(relative(this.src, path)));
  }

  /**
   * Return the resolved destination path for the current entry.
   *
   * @param {Object} entry The entry to resolve from.
   * @param {String} name The optional name to resolve the entry file to.
   */
  resolveEntryPath(entry, name) {
    if (!entry instanceof Object) {
      error('The defined entry does not match the Filesystem schema.');
    }

    if (!entry.dist) {
      error('The current entry has no destination path defined.');
    }

    if (name && typeof name !== 'string') {
      error([`Unable to resolve for ${entry.path}`, 'The given name is not a valid string.']);
    }

    // Defines the optional name for the current entyr, use the default
    // entry filename otherwise.
    const filename = name
      ? name.replace('{name}', this.resolveEntryName(entry))
      : basename(entry.path);

    return resolve(entry.dist, filename);
  }

  /**
   * Returns the actual name of the entry file without extension.
   *
   * @param {Object} entry The entry to resolve from.
   *
   * @returns The filename of the defined entry.
   */
  resolveEntryName(entry) {
    return basename(entry.path, extname(entry.path));
  }
}

module.exports = Filesystem;
