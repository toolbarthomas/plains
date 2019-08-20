class Tools {
  /**
   * Helper function to flatten an Array.
   *
   * @param {Array} arr The actual array to flatten.
   */
  flatten(arr) {
    return arr.reduce((flat, next) => flat.concat(next), []);
  }
}

module.exports = new Tools();
