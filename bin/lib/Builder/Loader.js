const { dirname, join, relative } = require('path');
const merge = require('webpack-merge');

class Loader {
  constructor(args, env) {
    this.args = args;
    this.env = env;

    this.config = {};
  }

  define() {
    this.defineFileLoader();
  }

  defineFileLoader() {
    this.config = merge(this.config, {
      module: {
        rules: [
          {
            test: /\.(png|jpg|gif)$/i,
            use: {
              loader: 'file-loader',
              options: {
                outputPath: (url, resource) => {
                  const path = relative(this.env.PLAINS_SRC, resource);

                  return join(dirname(path), url);
                },
              },
            },
          }
        ]
      }
    });
  }
}

module.exports = Loader;
