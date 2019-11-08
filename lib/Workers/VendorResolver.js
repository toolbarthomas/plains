const { dirname, join } = require('path');
const { copyFile, existsSync, sep } = require('fs');
const mkdirp = require('mkdirp');

const Worker = require('./Worker');

const { error, log, warning } = require('../Helpers/Logger');

class VendorResolver extends Worker {
  async start() {
    if (!this.config || !this.config.dependencies) {
      warning(
        'Unable to resolve any vendor, no dependencies have been defined.'
      );
    } else {
      await Promise.all(
        Object.keys(this.config.dependencies).map(
          async dependency => await this.resolveVendor(dependency)
        )
      );
    }

    this.resolve();
  }

  /**
   * Resolves all the defined paths for the current vendor.
   *
   * @param {String} dependency Resolves all paths from the defined dependency
   */
  async resolveVendor(dependency) {
    const paths = Array.isArray(this.config.dependencies[dependency])
      ? this.config.dependencies[dependency]
      : [this.config.dependencies[dependency]];

    log('Resolving dependency', dependency);

    await Promise.all(
      paths.map(
        path =>
          new Promise(callback => {
            let directory;

            try {
              directory = dirname(require.resolve(dependency));
              directory = directory.substr(
                0,
                directory.indexOf(dependency) + dependency.length
              );
            } catch (err) {
              if (err) {
                error(err);
              }
            }

            if (!existsSync(join(directory, path))) {
              warning(
                `Unable to resolve: ${dependency}, vendor does not exist.`
              );
              return callback();
            }

            const destination = join(
              this.services.Filesystem.resolveDestination(),
              this.config.dest || null,
              dependency,
              path
            );

            if (existsSync(destination)) {
              warning(`${dependency} has already been resolved.`);
              return callback();
            }

            return mkdirp(dirname(destination), async dirException => {
              if (dirException) {
                error(dirException);
              }

              await copyFile(
                join(directory, path),
                destination,
                copyException => {
                  if (copyException) {
                    error(copyException);
                  }

                  log('Resolved file', destination);

                  return callback();
                }
              );
            });
          })
      )
    );
  }
}

module.exports = VendorResolver;
