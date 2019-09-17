const browserSync = require('browser-sync');
const { existsSync } = require('fs');
const { resolve } = require('path');

const Plugin = require('./Plugin');
const { error, warning } = require('../Utils/Logger');

class DevServer extends Plugin {
  constructor(services) {
    super(services, 'server');
    this.instance = false;
  }

  mount() {
    super.mount();

    // Only create the DevServer for development environments.
    if (this.services.Store.get('plains', 'mode') !== 'development') {
      error([
        'Unable to create the development server.',
        'A development server can only be created for the development environment.',
        `Your current environment has been defined to ${this.config.mode}`,
      ]);
    }

    if (this.instance) {
      error('Unable to create a new DevServer, only 1 DevServer can be created.');
    }

    this.instance = browserSync.create('plains');
  }

  /**
   * Initialize the BrowserSync server.
   */
  init() {
    if (!this.instance || !browserSync.has(this.instance.name)) {
      error([
        'Unable to initalize the DevServer',
        'you should create one before it can be initialized',
      ]);
    }

    // Define the intial document root for the DevServer.
    const serverDirectories = [this.services.FileSystem.resolveDestination()];

    // Include the additional directories as document root if they exists.
    if (this.config.directories && Array.isArray(this.config.directories)) {
      this.config.directories.forEach(directory => {
        const path = resolve(process.cwd(), directory);

        if (existsSync(path)) {
          serverDirectories.push(path);
        } else {
          warning(`Server directory does not exists: ${path}`);
        }
      });
    }

    // Initialize BrowserSync.
    this.instance.init({
      open: false,
      directory: true,
      port: this.config.port,
      server: serverDirectories,
    });
  }
}

module.exports = DevServer;
