const { buildAllCommands } = require("../lib/cli-helpers");

const run = async () => {
  console.log(buildAllCommands("./console.json"));
};

module.exports = {
  run,
};
