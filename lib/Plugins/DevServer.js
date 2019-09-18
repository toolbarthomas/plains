const browserSync = require('browser-sync');
const { existsSync } = require('fs');
const { resolve } = require('path');

const Plugin = require('./Plugin');
const { error, log, warning } = require('../Utils/Logger');

class DevServer extends Plugin {
  constructor(services) {
    super(services, 'server', ['development']);
    this.instance = false;
    this.process = false;
    this.serverDirectories = [];
  }

  /**
   * Creates a BrowserSync server instance.
   */
  mount() {
    super.mount();

    // Ensure only one server instance can be created.
    if (this.instance) {
      error('Unable to create a new DevServer, only 1 DevServer can be created.');
    }

    // Create the actual server.
    this.instance = browserSync.create('plains');

    // Define the intial document root for the DevServer.
    this.serverDirectories.push(this.services.FileSystem.resolveDestination());

    // Include the additional directories as document root if they exists.
    if (this.config.directories && Array.isArray(this.config.directories)) {
      this.config.directories.forEach(directory => {
        const path = resolve(process.cwd(), directory);

        if (existsSync(path)) {
          this.serverDirectories.push(path);
        } else {
          warning(`Server directory does not exists: ${path}`);
        }
      });
    }
  }

  /**
   * Initialize the BrowserSync server.
   */
  init() {
    if (this.instance && this.instance.active) {
      this.reload();
    } else {
      this.instance.init({
        open: false,
        directory: true,
        port: this.config.port,
        server: this.serverDirectories,
      });
    }

    // Exit the server instance after the duration expired.
    if (!Number.isNaN(parseFloat(this.config.duration))) {
      this.process = setTimeout(() => {
        this.exit();
      }, this.config.duration);
    }
  }

  /**
   * Reloads the defined BrowserSync instance and reset the expiration duration.
   *
   * @param {*} arg Optional argument to pass within the reload.
   */
  reload(arg) {
    clearTimeout(this.process);

    this.instance.reload(arg);
  }

  exit() {
    log('Closing Development Server');

    this.instance.exit();

    this.resolve();
  }
}

module.exports = DevServer;
