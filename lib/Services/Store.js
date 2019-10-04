const { error, log } = require("../Helpers/Logger");

/**
 * Service that provides the states & data for the intial appication in
 * one or multiple Objects.
 */
class Store {
  constructor() {
    // Object where al commits will be stored.
    this.instances = {};
  }

  /**
   * Assigns the given state to the current Store instance.
   *
   * @param {Object} state The Object that will be commited to the Store
   * instance.
   * @param {String} key Commits the initial state within the defined key if it
   * exists, commit the defined state to the root instance otherwises.
   */
  commit(state, key) {
    if (!(state instanceof Object)) {
      throw new Error(
        "Unable to commit to Store, the initial state is not a valid Object"
      );
    }

    // Define the original state of the given (sub)instance.
    const origin =
      key && this.instances[key] instanceof Object
        ? this.instances[key]
        : key && !(this.instances[key] instanceof Object)
        ? {}
        : this.instances;

    // Merge the new & original state into a single commit.
    const commit = Object.assign(origin, state);

    /**
     * Merge the actual commit to the intial key, assign the actual commit to
     * the root instance if no key argument has been defined.
     */
    if (key) {
      if (this.instances[key]) {
        log("Store commit", `Updated ${key}`);
      } else {
        log("Store commit", `Created ${key}`);
      }

      this.instances[key] = commit;
    } else {
      log("Store updated");
      this.instances = commit;
    }
  }

  /**
   * Return the defined key from the intial Store instance, the complete Store
   * will be returned if the key argument has not been defined.
   *
   * @param {String} key Returns the selected key from the instances Object.
   *
   * @returns {Object} The intial key that will be returned.
   */
  use(key) {
    if (key && !this.instances[key]) {
      return error(
        `Unable to use Store entry: '${key}', the commit does not exists.`
      );
    }

    return !key ? this.instances : this.instances[key];
  }

  /**
   * Removes the selected key from the current Store instance if the defined key
   * exists within the Store instance. The whole instance will be clear if the
   * key parameter has not been defined.
   *
   * @param {String} key Removes the defined key from the Store instance.
   */
  prune(key) {
    if (key && !this.instance[key]) {
      return warning(`Unable to prune Store, ${key} does not exist`);
    }

    // Unset the key form the instance
    if (key && this.instances[key]) {
      this.instances[key] = null;

      return log("Store updated", `Deleted ${key}`);
    }
    this.instances = {};

    return log("Store updated", "Cleared all keys from the Store");
  }
}

module.exports = Store;
