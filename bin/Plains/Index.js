const Argv = require('./Argv');
const Environment = require('./Environment');

class Plains {
  constructor() {
    this.args = Argv.args;
    this.env = Environment.env;

    this.init();
  }

  init() {
    console.log(this);
  }
}

module.exports = new Plains();
