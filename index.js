const Plains = require('./core/Plains');

const App = new Plains({
  workers: {
    sass: {
      entry: [
        'base/stylesheets/*.scss',
      ],
    }
  }
});

App.boot();

// App.run();
App.watch();
