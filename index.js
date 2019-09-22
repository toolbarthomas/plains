const Plains = require('./lib/Plains');

const App = new Plains({
  workers: {
    sass: {
      entry: ['base/stylesheets/*.scss'],
    },
  },
});

App.start();
