class DevServer {
  constructor(services) {
    this.services = services;
    this.name = 'serve';
    this.machineName = 'Devserver';
  }

  mount() {
    console.log('Mount devserver');
    this.services.PluginManager.subscribe('DevServer', this.init.bind(this));

    // Get all tasks that have the DevServer Subscribed.
  }

  init() {
    console.log('Init server');
  }
}

module.exports = DevServer;
