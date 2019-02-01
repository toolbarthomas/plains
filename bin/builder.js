const Webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');

const webpackConfig = require('./webpack-config').init();

module.exports = PLAINS => {
  if (PLAINS.args.serve) {
    const compiler = Webpack(webpackConfig);

    console.log(PLAINS);

    const devServer = {
      host: PLAINS.config.PLAINS_HOSTNAME,
      port: PLAINS.config.PLAINS_PORT,
    };

    const server = new WebpackDevServer(compiler, devServer);

    server.listen(devServer.port, devServer.host, () => {
      console.log(`Server started at: ${devServer.host}:${devServer.port}`);
    });
  } else {
    Webpack(webpackConfig);
  }
}
