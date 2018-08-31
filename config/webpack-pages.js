const glob = require("glob");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");

module.exports = () => {
  let pages = glob.sync(`${process.env.SRC}/templates/*/index.html`);

  if (pages.length === 0) {
    return;
  }

  let plugins = [];

  for (let i = 0; i < pages.length; i++) {
    let filename = pages[i].replace(process.env.SRC + "/", "");

    let extension = path.extname(pages[i]);

    // Scopes the related entry file to our template.
    let chunks = [
      pages[i].replace(process.env.SRC + "/", "").replace(extension, "")
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
