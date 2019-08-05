const { warning, log } = require('../Utils/Logger');

class Store {
  constructor() {
    this.buckets = new Map();
  }

  /**
   * Creates a new Map instance to use as new Store.
   *
   * @param {String} name The name of the store to create.
   * @param {Object} data The optional data object that is available after
   * creating a new store
   */
  create(name, data) {
    if (this.buckets instanceof Map && !this.buckets.get(name)) {
      // Use the state Map to store the commited data into.
      const state = ['state', new Map()];

      // Create the new Store witn the defined name.
      this.buckets.set(name, new Map([state]));

      log(`Store created - Created bucket: ${name}`);

      if (data instanceof Object) {
        this.commit(name, data);
      }
    }
  }

  /**
   * Get the selected Bucket from the Store.
   *
   * @param {String} name The name of the store to use.
   *
   * @returns {Map|Boolean} Returns the Map if the actual Store exists.
   */
  use(name) {
    return this.buckets instanceof Map &&
      this.buckets.get(name) &&
      this.buckets.get(name).get('state')
      ? this.buckets.get(name)
      : undefined;
  }

  /**
   * Commit the defined data within the selected Bucket.
   *
   * @param {String} name The actual Bucket to commit the data to.
   * @param {Object} data The data object to commit within the Bucket.
   * @param {Boolean} silent Don't ouput any logs while commiting.
   */
  commit(name, data, silent) {
    let store = this.use(name);

    // Prepare a new Store if no has been defined.
    if (!store) {
      this.create(name);

      store = new Map();
    }

    if (data instanceof Object) {
      const entries = Object.keys(data);

      entries.forEach(entry => {
        this.buckets
          .get(name)
          .get('state')
          .set(entry, data[entry]);
      });

      if (!silent) {
        log(`Store updated - Committed to bucket: ${name}`);
      }
    } else {
      warning(`Unable to commit the data within ${name}, the given data is not a valid Object`);
    }
  }

  /**
   * Get the defined Bucket, if the entry paramater has been defined.
   *
   * @param {String} name The actual Store to Map the data to.
   * @param {String} entry Get only the selected entry when defined.
   *
   * @returns {*} The found value of the defined Store.
   */
  get(name, entry) {
    const store = this.use(name);

    if (!store || !(store instanceof Map)) {
      return undefined;
    }

    // Return the defined value of the selected Store if the given key exists.
    if (entry && store.get('state') instanceof Map) {
      return store.get('state').get(entry) || undefined;
    }

    const state = {};
    const keys = store.get('state').keys();

    if (!keys) {
      return undefined;
    }

    // Convert the given state into a Javascript Object.
    [...keys].forEach(key => {
      if (!Object.prototype.hasOwnProperty.call(state, key)) {
        state[key] = store.get('state').get(key);
      }
    });

    return state;
  }

  /**
   * Removes the defined bucket or a specific entry from the Store.
   *
   * @param {String} name The name of the bucket to prune.
   * @param {String} entry Removes only the defined entry from the actual bucket.
   */
  prune(name, entry) {
    const store = this.use(name);

    if (store) {
      if (typeof entry === 'string') {
        this.buckets.get(name).get('state').delete(entry);

        log(`Store updated - Removed '${entry}' from bucket: ${name}`);
      } else {
        log(`Bucket remove: ${name}`)
        this.buckets.get(name).delete('state');
      }
    } else {
      warning(`Unable to prune store '${name}', since it doesn't exist`);
    }
  }

  /**
   * Output an array with all bucket entry names.
   *
   * @returns {Array} The array with Store entries to return.
   */
  list() {
    return this.buckets && this.buckets instanceof Map ? [...this.buckets.keys()] : [];
  }
}

module.exports = Store;
