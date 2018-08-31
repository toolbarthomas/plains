const fs = require("fs");
const glob = require("glob");
const path = require("path");

module.exports = () => {
  let templates = glob.sync(`${process.env.SRC}/templates/*/index.js`);

  if (templates == null || templates.length === 0) {
    return {};
  }

  let entries = {};

  for (let i = 0; i < templates.length; i++) {
    let stats = fs.statSync(templates[i]);

    // Skip empty entry files.
    if (!stats.size) {
      continue;
    }

    // Remove the extension from the current name.
    let extension = path.extname(templates[i]);

    // Use the name as entry key to enable multiple entry points.
    let name = templates[i]
      .replace(process.env.SRC + "/", "")
      .replace(extension, "");

    // Append the actual entry
    entries[name] = templates[i];
  }

  // Return the multiple entry points.
  return entries;
};
