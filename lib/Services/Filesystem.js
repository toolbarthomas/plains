const { existsSync, writeFile } = require('fs');
const { sync } = require('glob');
const { basename, dirname, extname, join, relative, resolve, sep } = require('path');
const mkdirp = require('mkdirp');

const { error, log } = require('../Helpers/Logger');

class Filesytem {
  constructor() {
    // Stacks are collections where entry files can be subscribed to.
    this.stacks = new Map();

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

    log('Filesystem source path has been defined', this.src);

    this.src = resolve(path);
  }

  /**
   * Returns the source path if it has been defined.
   *
   * @returns {String} The defined source path.
   */
  resolveSource() {
    return this.src ? this.src : error(`No source path has been defined to the Filesystem.`);
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
}

module.exports = Filesytem;
