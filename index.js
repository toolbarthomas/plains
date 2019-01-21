const webpack = require("webpack");
const WebpackDevServer = require("webpack-dev-server");
const webpackConfig = require("./bin/webpack-config").init();

const app = () => {

  if (webpackConfig.devServer) {
    const compiler = webpack(webpackConfig);
    const { devServer } = webpackConfig;
    const server = new WebpackDevServer(compiler, devServer || {});

    server.listen(devServer.port, devServer.host, () => {
      console.log(`Project running at ${devServer.host}:${devServer.port}`);
    });
  }
  else {
    webpack(webpackConfig, () => {
      if (err, stats.hasErrors()) {
        throw new Error(err);
      }

      console.log('Done');
    })
  }
};

app();
