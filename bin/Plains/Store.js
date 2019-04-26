const { warning } = require('./Common/Logger');

class Store {
  constructor() {
    this.stores = new Map();
  }

  /**
   * Create a new Map instance to use as new Store.
   *
   * @param {String} name The name of the store to create.
   */
  create(name) {
    if (this.stores && !this.stores[name]) {
      this.stores.set(name, new Map());
    }
  }

  /**
   * Get the defined Store as Map
   *
   * @param {String} name The name of the store to use.
   *
   * @returns {Map|Boolean} Returns the Map if the actual Store exists.
   */
  use(name) {
    return this.stores instanceof Map && this.stores.get(name) ? this.stores.get(name) : null;
  }

  /**
   * Commit the defined data within the selected store.
   *
   * @param {String} name The actual Store to Map the data to.
   * @param {Object} data The data object to commit within the Store.
   */
  commit(name, data) {
    let store = this.use(name);

    // Prepare a new Store if no has been defined.
    if (!store) {
      this.create(name);

      store = new Map();
    }

    if (data instanceof Object) {
      const entries = Object.keys(data);

      entries.forEach(entry => {
        this.stores.get(name).set(entry, data[entry]);
      });
    } else {
      warning(`Unable to commit the data within ${name}, the given data is not a valid Object`);
    }
  }

  /**
   * Get the defined value of the selected Store.
   *
   * @param {String} name The actual Store to Map the data to.
   * @param {String} entry Get the key value of the given Store.
   *
   * @returns {*} The found value of the defined Store.
   */
  fetch(name, entry) {
    const store = this.use(name);

    return store && store instanceof Map ? store.get(entry) : null;
  }

  /**
   * Clears the current Map of the selected Store.
   *
   * @param {String} name The name of the store to prune.
   */
  prune(name) {
    const store = this.use(name);

    if (store) {
      this.stores.delete(name);
    } else {
      warning(`Unable to prune store '${name}', since it doesn't exist`);
    }
  }

  /**
   * Return an Array with the name of each Store.
   *
   * @returns {Array} The array with Store entries to return.
   */
  list() {
    return this.stores && this.stores instanceof Map ? [...this.stores.keys()] : [];
  }
}

module.exports = Store;
