const { error, info, log, success } = require('../Helpers/Logger');

class Contractor {
  constructor() {
    this.instances = {};
  }

  /**
   * Assigns the defined handler to the instances object within a Promise.s
   */
  subscribe(name, hook, handler, ...args) {
    if (!name) {
      return error('A name is required while subscribing a new handler to Contractor.');
    }

    // Prevent duplicate instance subscriptions.
    if (this.instances && this.instances[name]) {
      return error([
        'Unable to subscribe the new Contractor instance.',
        `An instance already exists with the name: ${name}`,
      ]);
    }

    // Throw an exception of the given handler is not a function.
    if (typeof handler !== 'function') {
      return error(`The defined handler for ${name} is not a function.`);
    }

    // Prepare the new Contractor Instance
    this.instances[name] = {};

    /**
     * Wrap the actual handler within a Promise wrapper in order to call the
     * intial in a asyncronous order.
     */
    const fn = () =>
      new Promise((resolve, reject) => {
        this.instances[name].resolve = resolve;
        this.instances[name].reject = reject;

        return handler(args);
      }).catch(exception => error(exception));

    // Assign the actual handler
    this.instances[name].fn = fn;

    // Assign the hook for the new subscription so it can actually be published.
    this.instances[name].hook = Array.isArray(hook) ? hook : hook ? [hook] : ['default'];

    log('Contractor updated', `Subscribed ${name} as ${hook}`);
  }

  /**
   * Returns all the subscribed hooks.
   */
  hooks() {
    if (!this.hasInstances()) {
      warning('Contractor has no subscriptions defined.');
    }

    const hooks = [];

    // Iterate within each instance and assign the subscribed hooks.
    Object.keys(this.instances).forEach(name => {
      const instance = this.instances[name];

      if (instance && instance.hook) {
        hooks.push(...instance.hook);
      }
    });

    // Filter out duplicate hooks.
    return hooks.filter((hook, index) => hooks.indexOf(hook) === index);
  }

  /**
   * Returns true if any subscription exists within the current Contractor
   * instance.
   *
   * @returns {Boolean} Returns TRUE if any subscription exists.
   */
  hasInstances() {
    return Object.keys(this.instances).length > 0;
  }

  /**
   * Initiate the handlers that have been subscribed to to defined hooks
   * argument.
   *
   * @param {String|Array} hook The hooks that shouls be published
   */
  async publish(hooks) {
    if (!hooks) {
      error('No hook has been defined to be published');
    }

    // Define the sequence order for the current publish.
    const batch = this.createBatch(hooks);

    if (!batch.parallel) {
      await batch.hook.reduce(
        (instance, hook) =>
          instance.then(async () => {
            return await this.handle(hook).then(() => {
              success(`Finished: ${hook}`);
            });
          }),
        Promise.resolve()
      );
    } else {
      await Promise.all(
        batch.hook.map(async hook => {
          return await this.handle(hook).then(() => {
            success(`Finished: ${hook}`);
          });
        })
      );
    }

    success('Done');
  }

  /**
   * Transforms the defined hook to an Array that can be iterated in a
   * sequential or parallel order.
   *
   * Any hooks chained with a comma will be called
   * in a sequential order and hooks that are chaind with a dot will run in
   * parallel order.
   *
   * @param {String|Array} hook The defined hook that will be Transformed
   */
  createBatch(hook) {
    if (Array.isArray(hook)) {
      return {
        hook: hook,
        parallel: false,
      };
    }

    if (hook.indexOf(',') >= 0 && hook.indexOf(',') > hook.indexOf('.')) {
      return {
        hook: hook.split(',').filter(item => item),
        parallel: false,
      };
    }

    if (hook.indexOf('.') >= 0 && hook.indexOf('.') > hook.indexOf(',')) {
      return {
        hook: hook.split('.').filter(item => item),
        parallel: true,
      };
    }

    return {
      hook: [hook],
      parallel: false,
    };
  }

  /**
   * Initiates the subscribed instances with the matching hook.
   *
   * @param {String} hook The hook of
   */
  async handle(hook) {
    const instances = Object.keys(this.instances).filter(
      instance => this.instances[instance].hook.indexOf(hook) >= 0
    );

    if (!instances || !instances.length) {
      error(`Unable to run ${hook}, it has not been subscribed.`);
    }

    info(`Starting ${hook}`);

    await instances.reduce(
      (compiler, instance) =>
        compiler.then(async () => {
          log(`Running instance`, instance);
          await this.instances[instance].fn();
        }),
      Promise.resolve()
    );
  }

  /**
   * Resolves the Promise from the defined Contractor sunscription.
   *
   * @param {String} name The name of the subscription to resolve.
   * @param  {...any} args Optional arguments to bind within the resolve handler.
   */
  resolve(name, ...args) {
    if (this.instances[name] && typeof this.instances[name].resolve === 'function') {
      this.instances[name].resolve(args);
    }
  }

  /**
   * Rejects the Promise from the defined Contractor sunscription.
   *
   * @param {String} name The name of the subscription to reject.
   * @param  {...any} args Optional arguments to bind within the reject handler.
   */
  reject(name, ...args) {
    if (this.instances[name] && typeof this.instances[name].reject === 'function') {
      this.instances[name].reject(args);
    }
  }
}

module.exports = Contractor;
