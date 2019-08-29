const browserSync = require('browser-sync');

class DevServer {
  constructor(services) {
    this.services = services;
    this.name = 'serve';
    this.machineName = 'Devserver';
    this.config = {};
  }

  mount() {
    this.config = this.services.Store.get('plains', 'plugins')

    this.services.PluginManager.subscribe('DevServer', this.init.bind(this));
  }

  init() {
    browserSync({
      open: false,
      port: this.services.Store.get('plains'),
      server: this.services.Filesystem.resolveDestination(),
    })
  }
}

module.exports = DevServer;
