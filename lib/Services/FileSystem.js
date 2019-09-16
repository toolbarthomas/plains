const { existsSync, writeFile } = require('fs');
const { sync } = require('glob');
const { basename, dirname, extname, join, relative, resolve, sep } = require('path');
const mkdirp = require('mkdirp');
const { error, log, warning, success } = require('../Utils/Logger');
const { flatten } = require('../Utils/Tools');

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
  defineRoot(path) {
    if (!existsSync(path)) {
      error(`The given root path does not exists: ${path}`);
    }

    this.src = resolve(path);
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
   * Returns the base destination directory.
   *
   * @returns {String} Returns the destination path of the dist directory.
   */
  resolveDestination() {
    if (!this.dist) {
      error([
        'There is no global destination path defined for the FileSystem service.',
        'You should define the destination path relative to the working directory of your Nodejs instance.',
      ]);
    }

    return this.dist;
  }

  /**
   * Return the subsribed stack entries within each stack or a specific
   * stack, if the stack argument exists within the FileSystem instance.
   *
   * @param {String} stack Returns the actual stack collection if it exists;
   *
   * @returns {Object} The selected Stack with all the defined entries.
   */
  getStack(stack) {
    // Throw an Exception if the requested stack does not exists.
    if (stack && !this.hasStack(stack)) {
      error(`Stack: ${stack} does not exists within the FileSystem instance.`);
    }

    return this.stacks.get(stack);
  }

  /**
   * Returns an array with paths of the defined stack entries.
   *
   * @param {String} stack Resolves the paths for the selected stack.
   *
   * @returns {Array} Returns an array with resolved directories.
   */
  getStackDirectories(stack) {
    const initialStack = this.getStack(stack);

    const map = [];

    initialStack.forEach(item => {
      const { cwd, entry } = item;

      if (!entry) {
        return;
      }

      const directory = join(cwd, dirname(entry));

      if (entry && map.indexOf(directory) < 0) {
        map.push(directory);
      }
    });

    return map;
  }

  resolveStackDirectories(stack) {
    const initialStack = this.getStack(stack);

    const directories = initialStack.map(item => (item.dist ? item.dist : null));
    const resolvedDirectories = directories.filter(
      (entry, index) => directories.indexOf(entry) === index
    );

    return resolvedDirectories;
  }

  /**
   * Returns an array with all entry paths from the defined stack;
   *
   * @param {String} name
   */
  source(name) {
    if (!name || !this.hasStack(name)) {
      error(`Stack: ${name} does not exists within the FileSystem instance.`);
    }

    // Prepare the Array which stores all defined stack paths.
    const entries = [];

    this.getStack(name).forEach(entry => {
      entries.push(entry.path);
    });

    return entries;
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
   * Inserts a new entry into the given stack.
   *
   * @param {String} stack The name of the stack to insert defined the entry.
   * @param {String} entries The defined entry paths.
   * @returns Returns the inserted paths if the exists or false if no false have been inserted.
   */
  insertEntry(stack, entries) {
    if (!this.hasStack(stack) || !entries) {
      return false;
    }

    // Ensure the entries can be iterated.
    const entryArray = Array.isArray(entries) ? entries : [entries];

    // Normalize the entry declerations and also include the entries with
    // a globbing pattern.
    const entryCollection = entryArray.map(entry => {
      let initialEntry = entry;

      // Define the relative path of the actual entry.
      const relativeEntry = relative(process.cwd(), entry);

      // Define the relative path of the defined FileSystem source directory.
      const relativeSrc = relative(process.cwd(), this.src);

      // Ensure the FileSystem source path is within the entry.
      if (relativeEntry.indexOf(relativeSrc) === 0) {
        initialEntry = relativeEntry.replace(relativeSrc, '').replace(sep, '');
      }

      // Resolve the current entry path(s)
      const src =
        entry.indexOf('*') >= 0
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
      };
    });

    // Get the defined stack in order to merge the given entries.
    const initialStack = this.stacks.get(stack);

    // Ensure there are no duplicate entries defined for the stack.
    const newStack = entrySubscriptions
      .filter(entry => {
        if (!initialStack[entry] && existsSync(entry.path)) {
          return entry;
        }
        if (
          initialStack[entry] &&
          entry.path !== initialStack[entry].path &&
          existsSync(entry.path)
        ) {
          return entry;
        }
        return null;
      })
      .concat(initialStack);

    // Update the stack with the new entries.
    if (newStack.length > 0) {
      this.stacks.set(stack, newStack);
    }

    return newStack;
  }

  /**
   * Returns an exception if the given entry is not according to the
   * FileSystem schema.
   *
   * @param {Object} Entry THe defined entry to validate.
   */
  // eslint-disable-next-line class-methods-use-this
  validateEntry(entry) {
    if (!(entry instanceof Object)) {
      error('The defined entry does not match the FileSystem schema.');
    }

    if (!entry.path) {
      error('The current entry has no source path defined.');
    }

    if (!entry.dist) {
      error('The current entry has no destination path defined.');
    }
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
    const resourceDestination = this.resolveEntryPath(entry, name);

    return new Promise(cb => {
      if (!data) {
        log('Skipping empty resource', resourceDestination);

        cb();
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
    this.validateEntry(entry);

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
    this.validateEntry(entry);

    return basename(entry.path, extname(entry.path));
  }
}

module.exports = FileSystem;
