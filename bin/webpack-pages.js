const HtmlWebpackPlugin = require("html-webpack-plugin");

const glob = require("glob");
const path = require("path");

const config = require("./config").init();

module.exports = {
  /**
   * Generates the page-template for each valid Webpack entry file.
   */
  getPages() {
    let pages = glob.sync(`${config.PLAINS_SRC}/templates/*/index.html`);

    if (pages.length === 0) {
      return;
    }

    let plugins = [];

    for (let i = 0; i < pages.length; i++) {
      let filename = pages[i].replace(config.PLAINS_SRC + "/", "");

      let extension = path.extname(pages[i]);

      // Scopes the related entry file to our template.
      let chunks = [
        pages[i].replace(config.PLAINS_SRC + "/", "").replace(extension, "")
      ];

      let plugin = new HtmlWebpackPlugin({
        filename: filename,
        template: pages[i],
        chunks: chunks
      });

      if (!plugin) {
        continue;
      }

      plugins.push(plugin);
    }

    return plugins;
  }
};
