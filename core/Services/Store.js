const { error, warning, log } = require('../Utils/Logger');

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

      log(`Store updated: ${name}`);

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
        log(`Store updated: Committed to ${name}`);
      }
    } else {
      warning(`Unable to commit the data within ${name}, the given data is not a valid Object`);
    }
  }

  /**
   * Merges the defined data to the specified entry of the selected Bucket.
   * This should be used to update the defined entry from a bucket.
   *
   * @param {String} name The name of the bucket that will be updated.
   * @param {String} key Defines the key that will be updated with the
   * mergable data.
   * @param {...Object} data Defines the object that will be merged in the bucket.
   *
   * @returns {Object} Returns a single object that has been merged in the bucket.
   */
  merge(name, entry, ...data) {
    const initialCommit = this.get(name);

    if (!initialCommit) {
      error(`Unable to merge to ${name}, the bucket does not exist`);
    }

    // Prepare the new commit if the intialCommit does not has any values to merge.
    if (
      !initialCommit[entry] &&
      data[0] instanceof Array &&
      initialCommit[entry] instanceof Array
    ) {
      initialCommit[entry] = [];
    } else if (
      !initialCommit[entry] &&
      data[0] instanceof Object &&
      initialCommit[entry] instanceof Object
    ) {
      initialCommit[entry] = {};
    } else if (initialCommit[entry].constructor !== data.constructor) {
      error(`Unable to merge to ${name}, you should define the data as an Object or an Array,`);
    }

    data.forEach(commit => {
      // Abort the current iteration if the current commit is not the same
      // instance as the intialCommit.
      if (commit.constructor !== initialCommit[entry].constructor) {
        return;
      }

      if (commit instanceof Array) {
        // Only push new values to the array.
        initialCommit[entry] = commit
          .filter(current => initialCommit[entry].indexOf(current) < 0)
          .concat(initialCommit[entry]);
      } else if (commit instanceof Object) {
        initialCommit[entry] = Object.assign(initialCommit[entry], commit);
      }
    });

    // Commit the merged data.
    this.commit(name, initialCommit, true);

    // Return the finalized data object.
    return initialCommit;
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
      return {};
    }

    // Return the defined value of the selected Store if the given key exists.
    if (entry && store.get('state') instanceof Map) {
      return store.get('state').get(entry) != null ? store.get('state').get(entry) : {};
    }

    const state = {};
    const keys = store.get('state').keys();

    if (!keys) {
      return {};
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

        log(`Store updated: Removed '${entry}' from ${name}`);
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
