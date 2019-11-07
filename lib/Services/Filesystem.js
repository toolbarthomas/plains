const { existsSync, writeFile } = require('fs');
const { sync } = require('glob');
const { basename, dirname, extname, join, relative, resolve, sep } = require('path');
const mkdirp = require('mkdirp');

const { error, log, warning, success } = require('../Helpers/Logger');

class Filesytem {
  constructor() {
    // Store the Filesystem subscriptions.
    this.instances = new Map();

    // The root path where the entry paths are located.
    this.src = false;

    // The destination path where each entry file will be written to.
    this.dist = false;
  }

  /**
   * Defines root path where the actual entries should exist in.
   *
   * @param {String} path The path that should be resolved as source path.
   */
  defineSource(path) {
    if (!existsSync(path)) {
      error(`The given source path does not exists: ${path}`);
    }

    this.src = resolve(path);

    log('Filesystem updated', `Defined source path: ${this.src}`);
  }

  /**
   * Returns the source path if it has been defined.
   *
   * @param {Boolean}
   *
   * @returns {String} The defined source path.
   */
  resolveSource(relativePath) {
    const src = relativePath ? relative(process.cwd(), this.src) : this.src;

    return src ? src : error(`No source path has been defined to the Filesystem.`);
  }

  /**
   * Defines the destination path where the processed entries will be written
   * to. The destination will be resolved relative to the path of the
   * working directory from the current process.
   *
   * @param {String} path The path that should be resolved as destination path.
   */
  async defineDestination(path) {
    if (path) {
      this.dist = resolve(path);

      // Create the destination directory if it doesn't exists yet.
      if (!existsSync(this.dist)) {
        log(`Creating destination directory: ${this.dist}`);

        await mkdirp(this.dist);
      }
    }
  }

  /**
   * Returns the defined destination path if it has been defined.
   *
   * @param {String} The defined destination path.
   */
  resolveDestination() {
    return this.dist
      ? this.dist
      : error('There is no destination path defined to the Filesystem service.');
  }

  /**
   * Helper function that checks if an instance has been subscribed with the
   * defined name parameter.
   *
   * @param {String} name The name that will be validated.
   */
  hasInstance(name) {
    return name && this.instances.has(name);
  }

  /**
   * Subscribes a new instance for the Filesystem.
   *
   * @param {String} name The name of the actual subscription.
   */
  subscribe(name) {
    if (this.hasInstance(name)) {
      return warning([
        `Unable to subscribe ${name} to the Filesystem.`,
        `${name} has already been defined by the Filesystem`,
      ]);
    }

    log('Filesystem updated', `Subscribed ${name}`);

    return this.instances.set(name, []);
  }

  /**
   * Return the subscribed Filesystem.
   *
   * @param {String} name The name of the subscription that will be returned.
   *
   * @returns {Array} The subscribed subscription.
   */
  publish(name) {
    if (!name || !this.hasInstance(name)) {
      warning(`Instance: ${name} does not exists within the Filesystem.`);
      return [];
    }

    return this.instances.get(name);
  }

  /**
   * Add the the defined path to the given Fileystem subscription.
   */
  defineEntry(name, entry) {
    if (!this.hasInstance(name)) {
      this.subscribe(name);
    }

    const queue = Array.isArray(entry) ? entry : [entry];

    // Prepare a single array with all the resolved entry paths.
    const collection = Filesytem.flattenPaths(
      queue.map(path => {
        const relativePath = relative(process.cwd(), path);
        const initialPath =
          relativePath.indexOf(this.resolveSource(true)) === 0
            ? relativePath.replace(this.resolveSource(true), '').replace(sep, '')
            : path;

        return path.indexOf('*') >= 0
          ? sync(resolve(this.resolveSource(), initialPath)).map(glob => resolve(glob))
          : [resolve(this.resolveSource(), initialPath)];
      })
    );

    // Remove any duplicate paths for the current commit.
    const subscription = collection
      .filter((path, index) => collection.indexOf(path) === index)
      .map(path => ({
        path,
        cwd: this.resolveSource(),
        src: relative(this.resolveSource(), path),
        dist: this.resolveEntryDestination(path),
      }));

    const initialSubscription = this.instances.get(name);

    // Filter out entries that already defined within the initial subscription.
    const commit = subscription.filter(initialEntry => {
      const duplicates = initialSubscription.filter(e => e.path === initialEntry.path);

      return !duplicates.length ? initialEntry : null;
    });

    /**
     * Set the actual commit to the Filesystem subscription if the commit is
     * unique.
     */
    if (commit.length) {
      log(
        'Filesystem updated',
        `Defined ${commit.length} new ${commit.length === 1 ? 'entry' : 'entries'} for ${name}`
      );
      this.instances.set(name, commit.concat(initialSubscription));
    }

    return commit;
  }

  /**
   * Returns the destination directory for the defined path.
   *
   * @param {String} path The path that will be resolved.
   */
  resolveEntryDestination(path) {
    return join(this.resolveDestination(), dirname(relative(this.resolveSource(), path)));
  }

  /**
   * Returns an array with all entry paths from the defined instance.
   *
   * @param {String} name
   */
  source(name) {
    if (!name || !this.hasInstance(name)) {
      warning(`Instance: ${name} does not exists within the Filesystem.`);
      return [];
    }

    return this.publish(name).filter(entry => entry.path);
  }

  /**
   * Iterator that exposes a Promise Object for each collection within
   * defined instance.
   *
   * @param {String} name The instance to iterate trough.
   * @param {Function} handler The function to use within each iteration.
   */
  async process(name, handler) {
    if (!name) {
      error('Unable to process instance, no instance has been defined');
    }

    if (typeof handler !== 'function') {
      error('The handler argument should be a valid function.');
    }

    const instance = this.publish(name);

    // Queue a Promise Object for each entry collection for the defined instance.
    const queue = [];

    // Define the actual Promise for each entry.
    instance.forEach(collection => {
      if (!Array.isArray(collection)) {
        queue.push(
          new Promise((callback, reject) => {
            handler(collection.path, callback, reject);
          })
        );
      } else {
        collection.forEach(entry => {
          queue.push(
            new Promise((callback, reject) => {
              handler(entry.path, callback, reject);
            })
          );
        });
      }
    });

    if (!queue.length) {
      warning(`No entry files where found within instance: ${name}.`);

      return Promise.resolve();
    }

    return Promise.all(queue);
  }

  /**
   * Returns the path of the processed entry.
   *
   * @param {String} path The source path of the actual entry.
   * @param {String} name The optional filename to include while resolving.
   */
  resolveEntry(entry, name) {
    Filesytem.validateEntry(entry);

    if (name && typeof name !== 'string') {
      warning([
        'Unable to resolve the current entry with a custom name',
        'The given name is not a string',
      ]);
    }

    const filename =
      name && typeof name === 'string'
        ? name.replace('{name}', this.defineEntryName(entry))
        : basename(entry.path);

    return resolve(entry.dist, filename);
  }

  /**
   * Defines the basename of the for the current entry.
   *
   * @param {Object} entry The entry to define the name from.
   */
  defineEntryName(entry) {
    Filesytem.validateEntry(entry);

    return basename(entry.path, extname(entry.path));
  }

  /**
   * Method to write multiple entries to the Filesystem in a parallel order.
   *
   * The batch can be defined within multiple ways. It is possible to define
   * an chain of arguments where the each entry uses the write method.
   * Or you can simple pass down an array or chained arguments with each entry
   * object.
   * A single entry is also possible to pass down within this method.
   *
   * @param  {...Function|Object} batch The batch with one or multiple
   * entry definitions.
   */
  async writeBatch(...batch) {
    return await Promise.all(
      batch.map(entry => {
        if (typeof entry === 'function') {
          return entry;
        }

        if (Array.isArray(entry)) {
          return this.write(entry[0], entry[1], entry[2]);
        }

        if (item instanceof Object) {
          return this.write(item.entry, item.data, item.name);
        }

        return null;
      })
    );
  }

  /**
   * Writes the defined data to the common destination directory.
   * The destination directory should be defined when creating a new instance of
   * the Filesystem.
   *
   * @param {Object} entry The defined entry that will be used.
   * @param {Buffer} data The data source as Buffer.
   * @param {String} name The filename of the processed entry.
   */
  write(entry, data, name) {
    const destination = this.resolveEntry(entry, name);

    return new Promise(cb => {
      if (!data) {
        log('Skipping empty resource', destination);

        cb();
      } else {
        mkdirp(dirname(destination), err => {
          if (err) {
            error(err);
          }

          log('Creating resource', destination);

          writeFile(destination, data, e => {
            if (e) {
              error(e);
            }

            success(`Resource created: ${destination}`);

            cb();
          });
        });
      }
    });
  }

  /**
   * Checks if the defined entry valid for the Filesystem to use.
   *
   * @param {Object} entry The entry to validate.
   */
  static validateEntry(entry) {
    if (!(entry instanceof Object)) {
      return error('The given entry does not match the Filesystem schema.');
    }

    if (!entry.path) {
      return error('The given entry has no source path defined.');
    }

    if (!entry.dist) {
      return error('The given entry has no destination path defined.');
    }

    return true;
  }

  /**
   * Helper function that combines all the defined paths into a single array.
   *
   * @param {Array} paths The actual array that will be flattened.
   */
  static flattenPaths(paths) {
    return paths.reduce((flat, next) => flat.concat(next), []);
  }
}

module.exports = Filesytem;
