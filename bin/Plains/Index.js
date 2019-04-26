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
    this.Store.create('bucket');
    // console.log(this.Store.stores);

    this.Store.commit('bucket', { title: 'Welcome to plains' });
    this.Store.commit('social', { title: '001' });

    // console.log(this.Store.use('bucket').get('title'));
    // console.log(this.Store.fetch('bucket', 'title'));

    console.log(this.Store.list());

    this.Store.prune('bucket');
  }
}

module.exports = new Plains();
