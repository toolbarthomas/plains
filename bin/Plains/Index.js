const Argv = require('./Argv');
const Environment = require('./Environment');
const Store = require('./Store');

class Plains {
  constructor() {
    /**
     * Store the CLI inserted arguments within the Plains object for easy
     * access within the Plains Builder.
     */
    this.Argv = new Argv();

    /**
     * Define the environment variables from the optional dotenv environment
     * file.
     */
    this.Environment = new Environment();

    /**
     * Create a new Store instance in order to interchange the data between
     * the various Builders.
     */
    this.Store = new Store();

    this.setup();
  }

  setup() {
    // Creates a new bucket
    this.Store.create('example');

    // Bind some data to the selected bucket.
    this.Store.commit('example', { title: 'Welcome to plains' });

    // Fetch a single value from the selected Bucket.
    console.log(this.Store.fetch('example', 'title'));

    // Fetch the complete Object from the selected Bucket.
    console.log(this.Store.fetch('example'));

    // List the defined Buckets
    console.log(this.Store.list());
  }
}

module.exports = new Plains();
