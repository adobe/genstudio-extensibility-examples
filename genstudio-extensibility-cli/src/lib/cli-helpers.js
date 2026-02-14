const { ORG_MAP, EXTENSION_MAP } = require("./context-loader");
const fs = require("node:fs");
const path = require("node:path");

const toKebabFromKey = (key) => key.toLowerCase().replaceAll(/_+/g, "-");

const toTitleFromKey = (key) =>
  key
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const toWorkflowTitle = (key) => {
  const tokens = key.split("_");
  if (tokens[0] === "GENSTUDIO") {
    tokens.shift();
  }
  if (tokens[tokens.length - 1] === "APP") {
    tokens.pop();
  }
  return tokens
    .map((token) => {
      if (token === "DAM" || token === "MLR" || token === "GA") {
        return token;
      }
      return token.charAt(0) + token.slice(1).toLowerCase();
    })
    .join(" ");
};

const findExtensionEntry = (extensionKey, org) => {
  const entries = EXTENSION_MAP[extensionKey] || [];
  if (!org) {
    return entries.length === 1 ? entries[0] : null;
  }
  return (
    entries.find((entry) => entry.org.id === org.id) ||
    entries.find((entry) => entry.org === org) ||
    null
  );
};

const parseWorkspaceUrl = (url) => {
  const preferredMatch =
    /projects\/\d+\/(\d+)\/workspaces\/(\d+)\/details/.exec(url);
  if (preferredMatch) {
    return {
      projectId: preferredMatch[1],
      workspaceId: preferredMatch[2],
    };
  }
  const fallbackMatch = /projects\/(\d+)\/workspaces\/(\d+)\/details/.exec(url);
  if (fallbackMatch) {
    return {
      projectId: fallbackMatch[1],
      workspaceId: fallbackMatch[2],
    };
  }
  return null;
};

const shellQuote = (value) => {
  if (!/[^\w./:-]/.test(value)) {
    return value;
  }
  return '"' + value.replaceAll('"', String.raw`\"`) + '"';
};

const generateCommands = ({
  org,
  extensionKey,
  workspaceName,
  consoleFile,
}) => {
  const extensionEntry = findExtensionEntry(extensionKey, org);
  if (!extensionEntry) {
    throw new Error(
      `Unknown or ambiguous extension: ${extensionKey} for org ${org.name}`,
    );
  }

  const workspaceUrl = extensionEntry.workspace[workspaceName];
  if (!workspaceUrl) {
    throw new Error(
      `Workspace ${workspaceName} not found for ${extensionKey} (${org.name})`,
    );
  }

  const ids = parseWorkspaceUrl(workspaceUrl);
  if (!ids) {
    throw new Error(`Could not parse IDs from URL: ${workspaceUrl}`);
  }

  const extensionSlug = toKebabFromKey(extensionKey);
  const envName = `${org.name} - ${extensionSlug} - workspace ${workspaceName}`;
  const quotedFile = shellQuote(consoleFile);

  const downloadCommand = [
    `export AIO_CLI_ENV=${org.aioEnv}`,
    "aio login -f",
    `aio console ws download --orgId ${org.id} --projectId ${ids.projectId} --workspaceId ${ids.workspaceId}`,
    `aio app use ${quotedFile} --overwrite`,
  ].join("; ");

  const createGhEnvCommand = [
    "gs-ext create-gh-env",
    `--env ${shellQuote(envName)}`,
    `--file ${quotedFile}`,
    `--aio-env ${org.aioEnv}`,
  ].join(" ");

  return { downloadCommand, createGhEnvCommand };
};

const createReadline = () =>
  require("node:readline").createInterface({
    input: process.stdin,
    output: process.stdout,
  });

const askQuestion = (rl, prompt) =>
  new Promise((resolve) => rl.question(prompt, resolve));

const selectFromList = async (rl, prompt, options) => {
  if (options.length === 0) {
    throw new Error(`No options available for ${prompt}`);
  }
  options.forEach((label, index) => {
    console.log(`  ${index + 1}) ${label}`);
  });
  while (true) {
    const answer = await askQuestion(rl, `${prompt} (1-${options.length}): `);
    const choice = Number.parseInt(answer.trim(), 10);
    if (!Number.isNaN(choice) && choice >= 1 && choice <= options.length) {
      return choice - 1;
    }
    console.log("Invalid selection. Try again.");
  }
};

const runInteractive = async (consoleFile) => {
  const rl = createReadline();
  try {
    console.log("Select app:");
    const extensionKeys = Object.keys(EXTENSION_MAP);
    const extensionLabels = extensionKeys.map(
      (key) => `${toKebabFromKey(key)} (${key})`,
    );
    const extensionIndex = await selectFromList(rl, "App", extensionLabels);
    const extensionKey = extensionKeys[extensionIndex];

    const entries = EXTENSION_MAP[extensionKey];
    console.log("\nSelect org:");
    const orgOptions = entries.map((entry) => entry.org);
    const orgLabels = orgOptions.map((org) => org.name);
    const orgIndex = await selectFromList(rl, "Org", orgLabels);
    const org = orgOptions[orgIndex];

    const workspaceNames = Object.keys(entries[orgIndex].workspace);
    console.log("\nSelect workspace:");
    const workspaceIndex = await selectFromList(
      rl,
      "Workspace",
      workspaceNames,
    );
    const workspaceName = workspaceNames[workspaceIndex];

    return { org, extensionKey, workspaceName, consoleFile };
  } finally {
    rl.close();
  }
};

const buildMarkdownTable = () => {
  const orgKeys = Object.keys(ORG_MAP);
  const orgs = orgKeys.map((key) => ORG_MAP[key]);
  const orgHeader = orgs
    .map(
      (org) =>
        `<th colspan="2" style="border: 1px solid #000; padding: 6px 10px;">${org.name}<br/>(aio ${org.aioEnv})</th>`,
    )
    .join("");
  const subHeader = orgs
    .map(
      () =>
        '<th style="border: 1px solid #000; padding: 6px 10px;">Workspace<br/>Stage</th><th style="border: 1px solid #000; padding: 6px 10px;">Workspace<br/>Prod</th>',
    )
    .join("");

  const rows = Object.keys(EXTENSION_MAP).map((extensionKey) => {
    const entries = EXTENSION_MAP[extensionKey];
    const cells = orgs
      .map((org) => {
        const entry = entries.find((item) => item.org.id === org.id);
        const stageUrl = entry?.workspace?.Stage || null;
        const prodUrl = entry?.workspace?.Production || null;
        const stageCell = stageUrl
          ? `<a href="${stageUrl}">Deployed</a>`
          : "N/A";
        const publishedNote = entry?.published ? "<br/>Published" : "";
        const prodCell = prodUrl
          ? `<a href="${prodUrl}">Deployed</a>${publishedNote}`
          : "N/A";
        return `<td style="border: 1px solid #000; padding: 6px 10px;">${stageCell}</td><td style="border: 1px solid #000; padding: 6px 10px;">${prodCell}</td>`;
      })
      .join("");
    return `<tr><td style="border: 1px solid #000; padding: 6px 10px;">${toTitleFromKey(extensionKey)}</td>${cells}</tr>`;
  });

  return [
    '<table style="border-collapse: collapse;">',
    "<thead>",
    `<tr><th style="border: 1px solid #000; padding: 6px 10px;"></th>${orgHeader}</tr>`,
    `<tr><th style="border: 1px solid #000; padding: 6px 10px;">App</th>${subHeader}</tr>`,
    "</thead>",
    "<tbody>",
    ...rows,
    "</tbody>",
    "</table>",
  ].join("\n");
};

const buildAllCommands = (consoleFile) => {
  const sections = [];

  Object.keys(EXTENSION_MAP).forEach((extensionKey) => {
    const entries = EXTENSION_MAP[extensionKey];
    entries.forEach((entry) => {
      const org = entry.org;
      Object.keys(entry.workspace).forEach((workspaceName) => {
        const { downloadCommand, createGhEnvCommand } = generateCommands({
          org,
          extensionKey,
          workspaceName,
          consoleFile,
        });
        sections.push(
          [
            "========================================================",
            `# ${org.name} - ${toKebabFromKey(extensionKey)} - ${workspaceName}`,
            "# Download console.json",
            downloadCommand,
            "",
            "# Create GitHub environment secrets",
            createGhEnvCommand,
          ].join("\n"),
        );
      });
    });
  });

  return `${sections.join("\n\n")}\n========================================================`;
};

const buildWorkflowYaml = (extensionKey, entries, type) => {
  const app = toKebabFromKey(extensionKey);
  const workspaceName = type === "main" ? "Production" : "Stage";
  const workflowName = `${toWorkflowTitle(extensionKey)} ${
    type === "main" ? "Main" : "PR"
  }`;
  const eventBlock =
    type === "main"
      ? `on:
  push:
    branches:
      - main
    paths:
      - "${app}/**"
  workflow_dispatch:`
      : `on:
  pull_request:
    paths:
      - "${app}/**"
  workflow_dispatch:`;
  const jobName = type === "main" ? "deploy" : "pr";
  const environments = entries
    .map((entry, index) => {
      const suffix = index === entries.length - 1 ? "" : ",";
      return `          "${entry.org.name} - ${app} - workspace ${workspaceName}"${suffix}`;
    })
    .join("\n");

  return `name: ${workflowName}

${eventBlock}

jobs:
  ${jobName}:
    uses: ./.github/workflows/aio-app-template.yml
    with:
      app: ${app}
      environment: |
        [
${environments}
        ]
    secrets: inherit
`;
};

const generateWorkflows = () => {
  const workflowsDir = path.resolve(process.cwd(), ".github", "workflows");
  if (!fs.existsSync(workflowsDir)) {
    fs.mkdirSync(workflowsDir, { recursive: true });
  }

  Object.keys(EXTENSION_MAP).forEach((extensionKey) => {
    const entries = EXTENSION_MAP[extensionKey];
    const app = toKebabFromKey(extensionKey);
    const mainFile = path.join(workflowsDir, `main-${app}.yaml`);
    const prFile = path.join(workflowsDir, `pr-${app}.yaml`);

    fs.writeFileSync(
      mainFile,
      buildWorkflowYaml(extensionKey, entries, "main"),
      "utf8",
    );
    fs.writeFileSync(
      prFile,
      buildWorkflowYaml(extensionKey, entries, "pr"),
      "utf8",
    );
  });
};

module.exports = {
  buildAllCommands,
  buildMarkdownTable,
  generateCommands,
  generateWorkflows,
  runInteractive,
};
