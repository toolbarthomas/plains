const glob = require("glob");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");

const ENV = require("./utils/environment");

/**
 * Generates the page-template for each valid Webpack entry file.
 */
module.exports = () => {
  let pages = glob.sync(`${ENV.PLAINS_SRC}/templates/*/index.html`);

  if (pages.length === 0) {
    return;
  }

  let plugins = [];

  for (let i = 0; i < pages.length; i++) {
    let filename = pages[i].replace(ENV.PLAINS_SRC + "/", "");

    let extension = path.extname(pages[i]);

    // Scopes the related entry file to our template.
    let chunks = [
      pages[i].replace(ENV.PLAINS_SRC + "/", "").replace(extension, "")
    ];

    console.log(chunks);

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
};
