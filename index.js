const args = require('./bin/args');
const environmentConfig = require('./bin/environment-config');
const builder = require('./bin/builder');

// Create the Plains Object
const PLAINS = {
  args: args.init(),
  config: environmentConfig.init(),
};

// Export the actual Plains configration within the.
process.PLAINS = PLAINS;

// Start Plains.
builder(PLAINS);
