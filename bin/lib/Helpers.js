const { join } = require('path')
const { lstatSync, readdirSync } = require('fs')

class Helpers {
  /**
   * Returns an array with directory entries from the given path.
   *
   * @param {String} path Define the directory sync path.
   *
   * @returns {Array} Array with all directory paths.
   */
  getDirectories(path) {
    return readdirSync(path).map(name => join(path, name))
      .filter(source => (
        lstatSync(source).isDirectory()
      )
    )
  }
}

module.exports = new Helpers();
