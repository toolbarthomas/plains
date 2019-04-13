const { resolve } = require('path');
const merge = require('webpack-merge');

const Loader = require('./Loader');
const Entries = require('./Entries');
const TemplateBuilder = require('./TemplateBuilder');

class Builder {
  constructor(args, env) {
    this.args = args;
    this.env = env;

    this.config = {
      mode: env.PLAINS_ENVIRONMENT,
      output: {
        path: resolve(env.PLAINS_DIST),
        publicPath: '/',
      },
    }
  }

  define() {
    const { args, env } = this;

    const instances = [
      new Loader(args, env),
      new Entries(args, env),
      new TemplateBuilder(args, env)
    ]

    instances.forEach(instance => {
      instance.define();

      this.config = merge(this.config, instance.config);
    });
  }
}

module.exports = Builder;
