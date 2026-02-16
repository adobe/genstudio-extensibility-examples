const { generateWorkflows } = require("../lib/cli-helpers");

const run = async () => {
  generateWorkflows();
  console.log("Workflow files generated in .github/workflows.");
};

module.exports = {
  run,
};
