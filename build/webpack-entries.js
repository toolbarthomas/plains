const fs = require("fs");
const glob = require("glob");
const path = require("path");

const ENV = require("./utils/environment").init();

/**
 * Define one or more entry files for Webpack, each entry file is defined as a
 *  subdirectory within the `templates` directory in the `PLAINS_SRC` directory.
 */
module.exports = () => {
  let templates = glob.sync(`${ENV.PLAINS_SRC}/templates/*/index.js`);

  if (templates == null || templates.length === 0) {
    return {};
  }

  let entries = {};

  for (let i = 0; i < templates.length; i++) {
    let stats = fs.statSync(templates[i]);

    /**
     * Skip empty entry files.
     */
    if (!stats.size) {
      continue;
    }

    /**
     * Strip out the extension before defining the entry key.
     */
    let extension = path.extname(templates[i]);

    /**
     * Define the entry key for the current Webpack entry file.
     */
    let name = templates[i]
      .replace(`${ENV.PLAINS_SRC}/`, "")
      .replace(extension, "");

    /**
     * Queue the current entry file
     */
    entries[name] = templates[i];
  }

  /**
   * Return all entry files.
   */
  return entries;
};
