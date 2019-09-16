const Plains = require('./lib/Plains');

const App = new Plains({
  workers: {
    sass: {
      entry: ['base/stylesheets/index.scss', 'base/stylesheets/foo.scss'],
    },
  },
});

App.boot();

App.run();
