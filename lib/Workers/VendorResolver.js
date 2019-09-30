const { dirname, join } = require('path');
const { copyFile, existsSync } = require('fs');
const mkdirp = require('mkdirp');

const Worker = require('./Worker');
const { error, log, warning } = require('../Utils/Logger');

class VendorResolver extends Worker {
  /**
   * Resolve the defined vendors to the destination
   */
  async mount() {
    if (!this.config || !(this.config instanceof Object) || !this.config.dependencies) {
      warning('Unable to resolve any vendor, no vendors have been defined');

      this.resolve();
    } else {
      // Resolve each dependency in a paralell order.
      const queue = Object.keys(this.config.dependencies).map(
        vendor =>
          new Promise(callback => {
            const path = this.config.dependencies[vendor];

            let directory;

            try {
              directory = dirname(require.resolve(vendor));
            } catch (err) {
              if (err) {
                error(err);
              }
            }

            if (!existsSync(join(directory, path))) {
              warning(`Unable to resolve: ${vendor}, vendor has not been installed.`);
              return callback();
            }

            const destination = join(
              this.services.FileSystem.resolveDestination(),
              this.config.dest || null,
              vendor,
              path
            );

            if (existsSync(destination)) {
              warning(`${vendor} has already been resolved.`);
              return callback();
            }

            mkdirp(dirname(destination), async dirError => {
              if (dirError) {
                error(dirError);
              }

              log('Resolving package', vendor);

              await copyFile(join(directory, path), destination, fileError => {
                if (fileError) {
                  error(fileError);
                }

                log('Resolved package to', destination);

                return callback();
              });
            });
          })
      );

      // Resolve the dependencies in a paralell order.
      await Promise.all(queue);

      // Resolve the actual worker
      this.resolve();
    }
  }
}

module.exports = VendorResolver;
