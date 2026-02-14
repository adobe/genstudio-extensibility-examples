const { buildMarkdownTable } = require("../lib/cli-helpers");

const run = async () => {
  console.log(buildMarkdownTable());
};

module.exports = {
  run,
};
