class SassCompiler {
  constructor(services) {
    this.services = services;
    this.taskName = 'sass';

    this.config = {
      task: 'sass',
    }
  }

  mount() {
    this.services.Filesystem.createStack('sassCompiler');

    this.services.Store.create('sassCompiler', { entry: ['bar', 'bla'] });

    this.services.Store.merge('sassCompiler', 'entry', ['foo']);
    this.services.Store.prune('sassCompiler', 'entry');

    //this.services.Store.merge('sassCompiler', 'SassCompiler', { foo: 'bla' }, { foo: 'blo' }, { foo: 'bloe' });

    this.services.Contractor.subscribe(this.taskName, this.init.bind(this), true);
  }

  init() {
    console.log(this.services.Store.get('sassCompiler'));
  }
}

module.exports = SassCompiler;
