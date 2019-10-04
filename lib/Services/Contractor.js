const { error, info, log, success, warning } = require('../Utils/Logger');

/**
 * Contractor is an Observer class that holds all the worker that will be used
 * when a task is being called.
 */
class Contractor {
  constructor() {
    // Store all subscription within an Object.
    this.subscriptions = {};
  }

  /**
   * Store a new subscription with the defined name & handler in the
   * subscriptions Object.
   *
   * @param {String} name The identifier for the actual subscription.
   * @param {String} hook The hook that should be used to call to actual
   * subscription.
   * @param {Object|function} handler Handle the actual function for the defined
   * subscription.
   */
  subscribe(name, hook, handler) {
    // Ensure the subscriptions Object has been created.
    if (!(this.subscriptions instanceof Object)) {
      return error('Unable define a new subscription, the subscriptions instance is not an Object');
    }

    // Only create new subscriptions.
    if (this.subscriptions && this.subscriptions[name] instanceof Object) {
      return warning(
        `Unable to subscribe ${name}, an instance has already been subscribed with this name.`
      );
    }

    // Assign the handlers for the intial subscription.
    const instance = typeof handler === 'function' ? ['publish'] : Object.keys(handler);

    // Create a new subscription and assign the given hook to it.
    const subscription = {
      hook,
    };

    // Assign each method handler for the defined subscription.
    instance.forEach(method => {
      subscription[method] = {};

      subscription[method].fn = () =>
        new Promise((resolve, reject) => {
          subscription[method].resolve = resolve;
          subscription[method].reject = reject;

          return handler[method]();
        }).catch(exception => error(exception));
    });

    log('Subscribing', name);

    // Asssign the actual subscription to the Contractor instance.
    this.subscriptions[name] = subscription;

    // Return the new subscription.
    return subscription;
  }

  /**
   * Defines an Array with all the subscriptions names that have been subscribed
   * with the defined hook.
   * @param {String} hook The actual keyword to filter the subscriptions from.
   */
  getSubscriptionsFromHook(hook) {
    if (!this.subscriptions) {
      error('No instances have been subscribed.');
    }

    if (!hook) {
      error('A hook is required to get the actual subscriptions');
    }

    return Object.keys(this.subscriptions).filter(name => this.subscriptions[name].hook === hook);
  }

  /**
   * Returns an array with al the tasks that have been registered to the defined
   * worker.
   *
   * @param {String} name The identifier filter to get the defined;
   */
  getHookFromSubscription(name) {
    if (!name || !this.subscriptions[name]) {
      error('Unable to define hook from non-existing subscription.');
    }

    return this.subscriptions && this.subscriptions[name]
      ? this.subscriptions[name].hook || null
      : null;
  }

  /**
   * Resolves the subscribed handler if it has been subscribed as an
   * asynchronous function.
   *
   * @param {String} name The name of the subscription that should be resolved.
   * @param {String} method The name of the method handler to resolve.
   * @param {...Object} args Optional argument to pass within the Promise resolve.
   */
  resolve(name, method, ...args) {
    if (!this.subscriptions[name]) {
      return error(`Unable to resolve undefined subscription: ${name}.`);
    }

    if (typeof this.subscriptions[name][method || 'publish'].resolve !== 'function') {
      return warning(`No resolve method has been defined for subscription: ${name}::${method}`);
    }

    return this.subscriptions[name][method || 'publish'].resolve(args);
  }

  /**
   * Rejects the subscribed handler if it has been subscribed as an asynchronous
   * function.
   *
   * @param {String} name The name of the subscription that should be rejected.
   * @param {String} method The name of the method handler to reject.
   * @param {...Object} args Optional argument to pass within the Promise
   * rejection.
   */
  reject(name, method, ...args) {
    if (!this.subscriptions[name]) {
      return error(`Unable to reject undefined subscription: ${name}.`);
    }

    if (typeof this.subscriptions[name][method || 'publish'].reject !== 'function') {
      return warning(`No reject method has been defined for subscription: ${name}`);
    }

    return this.subscriptions[name][method || 'publish'].reject(args);
  }

  /**
   * Returns the initial handler for the defined subscription lifecycle method.
   *
   * @param {String} hook The hook of the defined subscription to use.
   * @param {String} method The returns the defined lifecycle method handler.
   */
  async handle(name, method) {
    if (
      !this.subscriptions[name] ||
      !this.subscriptions[name][method || 'publish'] ||
      typeof this.subscriptions[name][method || 'publish'].fn !== 'function'
    ) {
      error(
        `Unable to publish: ${name}, ${method ||
          'publish'} doest not exists within the subscribed instance`
      );
    }

    await this.subscriptions[name][method || 'publish'].fn();
  }

  /**
   * Initiate the publish function for each defined task.
   *
   * @param {String|Array} hook The hook to publish.
   */
  async publish(hook) {
    if (!this.subscriptions) {
      error('Unable to initiate Contractor, no instances have been subscribed');
    }

    if (!hook) {
      error('Unable to publish, no hook has been defined.');
    }

    // Ensure the queue is always constructed as an Array.
    let queue;

    if (Array.isArray(hook)) {
      queue = hook;
    } else if (typeof hook === 'string' && hook.indexOf(',') >= 0) {
      queue = hook.split(',');
    } else {
      queue = [hook];
    }

    // Filter out any duplicates entries.
    queue = queue.filter((item, index) => queue.indexOf(item) === index);

    // Track the elapsed build time.
    const timestamp = process.hrtime();

    /**
     * Initiate the prePublish method for each subscription within a parallel
     * order.
     */
    await Promise.all(Object.keys(this.subscriptions).map(name => this.handle(name, 'prePublish')));

    // Initiate each initial subscription within a sequential order.
    await queue.reduce(
      (instance, currentHook) =>
        instance.then(async () => {
          await Promise.all(
            currentHook.split('.').map(async task => {
              const subscriptions = this.getSubscriptionsFromHook(task);

              if (subscriptions && subscriptions.length) {
                info(`Starting: ${task}`);

                await subscriptions.reduce(
                  async (subInstance, subscription) =>
                    subInstance.then(async () => {
                      await this.handle(subscription);
                    }),
                  Promise.resolve()
                );

                success(`Finished: ${task}`);
              } else {
                error(`The given task '${task}' has not been subscribed.`);
              }
            })
          );
        }),
      Promise.resolve()
    );

    success('Done');

    const duration =
      (process.hrtime(timestamp)[0] * 1000 + process.hrtime(timestamp)[1] / 1e6) / 1000;

    log('Elapsed build time', `${Math.round(duration * 10) / 10}s`);
  }
}

module.exports = Contractor;
