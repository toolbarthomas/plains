const browserSync = require('browser-sync');

class DevServer {
  constructor(services) {
    this.services = services;
    this.name = 'serve';
    this.machineName = 'DevServer';
    this.config = {};
    this.instance = false;
  }

  mount() {
    this.config = this.services.Store.get('plains', 'plugins')[this.machineName];

    this.services.PluginManager.subscribe(this.machineName, this.init.bind(this));
  }

  async init() {
    // Ensure the DevServer is created once.
    if (this.instance) {
      this.instance.reload();

      return;
    }

    // Save the BrowserSync instance to the class instance.
    this.instance = browserSync.create('plains');

    // Intialize the DevServer.
    this.instance.init({
      open: false,
      directory: true,
      port: this.config.port,
      server: this.services.Filesystem.resolveDestination(),
    });
  }
}

module.exports = DevServer;
