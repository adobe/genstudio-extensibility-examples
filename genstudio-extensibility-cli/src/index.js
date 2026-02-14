#!/usr/bin/env node

const COMMANDS = {
  "get-commands": () => require("./commands/get-commands"),
  "get-table": () => require("./commands/get-table"),
  "get-all-commands": () => require("./commands/get-all-commands"),
  "generate-workflows": () => require("./commands/generate-workflows"),
  "create-gh-env": () => require("./commands/create-gh-env"),
};

const printHelp = () => {
  const commandList = Object.keys(COMMANDS)
    .map((command) => `  gs-ext ${command}`)
    .join("\n");

  console.log(`Usage: gs-ext <action>

Examples:
${commandList}
  gs-ext create-gh-env --env "Env Name" --file ./console.json --aio-env stage

Options:
  --help, -h     Show this help
`);
};

const runCli = async () => {
  const args = process.argv.slice(2);
  const action = args[0];
  if (!action || action === "--help" || action === "-h") {
    printHelp();
    return;
  }

  const getCommand = COMMANDS[action];
  if (!getCommand) {
    console.error(`Unknown action: ${action}`);
    printHelp();
    process.exit(1);
  }

  try {
    const command = getCommand();
    await command.run(args.slice(1));
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

if (require.main === module) {
  runCli();
}

module.exports = {
  runCli,
};
