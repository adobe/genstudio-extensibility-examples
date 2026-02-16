const { generateCommands, runInteractive } = require("../lib/cli-helpers");

const run = async () => {
  const consoleFile = "./console.json";
  const selection = await runInteractive(consoleFile);
  const { downloadCommand, createGhEnvCommand } = generateCommands(selection);
  const result = `
========================================================
# Download console.json
${downloadCommand}

# Create GitHub environment secrets
${createGhEnvCommand}
========================================================
    `;
  console.log(result);
};

module.exports = {
  run,
};
