const { join } = require('path');
const { existsSync, lstatSync, readdirSync } = require('fs');

class FileSystem {
  /**
   * Returns an array with directory entries from the given path.
   *
   * @param {String} path Define the directory sync path.
   *
   * @returns {Array} Array with all directory paths.
   */
  static getDirectories(path) {
    let directories = [];

    if (existsSync(path)) {
      directories = readdirSync(path)
        .map(name => join(path, name))
        .filter(source => lstatSync(source).isDirectory());
    }

    return directories;
  }
}

module.exports = new FileSystem();
