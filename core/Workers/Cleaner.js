class Cleaner {
  constructor(services) {
    this.services = services;

    this.services.Contractor.subscribe('default', this.init.bind(this), true);
  }

  init() {
    setTimeout(() => {
      console.log('Default task set to Cleaner');
      this.services.Contractor.resolve('default');
    }, 2000);
  }
}

module.exports = Cleaner;
