const browserSync = require('browser-sync');

class DevServer {
  constructor(services) {
    this.services = services;
    this.name = 'serve';
    this.machineName = 'DevServer';
    this.config = {};
  }

  mount() {
    this.config = this.services.Store.get('plains', 'plugins')[this.machineName];

    this.services.PluginManager.subscribe(this.machineName, this.init.bind(this));
  }

  init() {
    return;

    this.instance = browserSync({
      open: false,
      directory: true,
      port: this.config.port,
      server: this.services.Filesystem.resolveDestination(),
    })
  }
}

module.exports = DevServer;
