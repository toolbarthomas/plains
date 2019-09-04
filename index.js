const Plains = require('./core/Plains');

const App = new Plains({
  workers: {
    sass: {
      entry: [
        'base/stylesheets/index.scss',
      ],
    }
  }
});

App.boot();

App.run();
