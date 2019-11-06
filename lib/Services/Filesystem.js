const { existsSync, writeFile } = require('fs');
const { sync } = require('glob');
const { basename, dirname, extname, join, relative, resolve, sep } = require('path');
const mkdirp = require('mkdirp');

const { error, log } = require('../Helpers/Logger');

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
   * Subscribes a new stack for the Filesystem.
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
   * Helper function that combines all the defined paths into a single array.
   *
   * @param {Array} paths The actual array that will be flattened.
   */
  static flattenPaths(paths) {
    return paths.reduce((flat, next) => flat.concat(next), []);
  }
}

module.exports = Filesytem;
