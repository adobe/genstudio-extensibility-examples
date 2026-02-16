const { Octokit } = require("@octokit/core");
const sodium = require("libsodium-wrappers");
const fs = require("node:fs");
const path = require("node:path");
const process = require("node:process");

const DEFAULT_CONFIG = {
  owner: "adobe",
  repo: "genstudio-uix-examples",
  environment_name: "Test Environment",
  secret_file: "./console.json",
  env_file: "./.env.local",
  github_token: process.env.GITHUB_TOKEN,
  aio_env: "prod",
  verbose: false,
  dry_run: false,
};

function printHelp() {
  console.log(`
GitHub Environment Secrets Manager

Usage: gs-ext create-gh-env [options]

Options:
  --env <name>       Name of the GitHub environment (default: "Test Environment")
  --file <path>      Path to the secrets JSON file (default: "./console.json")
  --env-file <path>  Path to the env file (default: "./.env.local")
  --token <token>    GitHub token (default: uses GITHUB_TOKEN env variable)
  --owner <owner>    Repository owner (default: "adobe")
  --repo <repo>      Repository name (default: "genstudio-uix-examples")
  --aio-env <value>  AIO CLI environment: stage|prod (default: "prod")
  --dry-run          Print actions without calling GitHub APIs
  --dryrun           Alias for --dry-run
  --verbose, -v      Print detailed progress logs
  --help             Show this help message
  `);
}

function parseArgs(rawArgs) {
  const args = rawArgs || process.argv.slice(2);
  const config = { ...DEFAULT_CONFIG };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--env" && i + 1 < args.length) {
      config.environment_name = args[++i];
    } else if (args[i] === "--file" && i + 1 < args.length) {
      config.secret_file = args[++i];
    } else if (args[i] === "--token" && i + 1 < args.length) {
      config.github_token = args[++i];
    } else if (args[i] === "--owner" && i + 1 < args.length) {
      config.owner = args[++i];
    } else if (args[i] === "--repo" && i + 1 < args.length) {
      config.repo = args[++i];
    } else if (args[i] === "--env-file" && i + 1 < args.length) {
      config.env_file = args[++i];
    } else if (args[i] === "--aio-env" && i + 1 < args.length) {
      const provided = String(args[++i]).toLowerCase();
      if (provided !== "stage" && provided !== "prod") {
        throw new Error('--aio-env must be either "stage" or "prod".');
      }
      config.aio_env = provided;
    } else if (args[i] === "--dry-run" || args[i] === "--dryrun") {
      config.dry_run = true;
    } else if (args[i] === "--verbose" || args[i] === "-v") {
      config.verbose = true;
    } else if (args[i] === "--help" || args[i] === "-h") {
      printHelp();
      return null;
    }
  }

  if (!path.isAbsolute(config.secret_file)) {
    config.secret_file = path.resolve(process.cwd(), config.secret_file);
  }
  if (!path.isAbsolute(config.env_file)) {
    config.env_file = path.resolve(process.cwd(), config.env_file);
  }
  return config;
}

const secretMapping = {
  AIO_PROJECT_ID: (f) => f.project.id,
  AIO_PROJECT_NAME: (f) => f.project.name,
  AIO_PROJECT_ORG_ID: (f) => f.project.org.id,
  AIO_PROJECT_WORKSPACE_DETAILS_SERVICES: (f) =>
    JSON.stringify(f.project.workspace.details.services),
  AIO_PROJECT_WORKSPACE_ID: (f) => f.project.workspace.id,
  AIO_PROJECT_WORKSPACE_NAME: (f) => f.project.workspace.name,
  AIO_RUNTIME_AUTH: (f) =>
    f.project.workspace.details.runtime.namespaces[0].auth,
  AIO_RUNTIME_NAMESPACE: (f) =>
    f.project.workspace.details.runtime.namespaces[0].name,
  CLIENTID: (f) =>
    f.project.workspace.details.credentials[0].oauth_server_to_server.client_id,
  CLIENTSECRET: (f) =>
    f.project.workspace.details.credentials[0].oauth_server_to_server
      .client_secrets[0],
  IMSORGID: (f) => f.project.org.ims_org_id,
  SCOPES: (f) =>
    f.project.workspace.details.credentials[0].oauth_server_to_server.scopes.join(
      ",",
    ),
  TECHNICALACCOUNTEMAIL: (f) =>
    f.project.workspace.details.credentials[0].oauth_server_to_server
      .technical_account_email,
  TECHNICALACCOUNTID: (f) =>
    f.project.workspace.details.credentials[0].oauth_server_to_server
      .technical_account_id,
};

function loadSecretFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Secret file not found: ${filePath}`);
  }
  const fileContent = fs.readFileSync(filePath, "utf8");
  return JSON.parse(fileContent);
}

function loadEnvSecrets(filePath) {
  if (!fs.existsSync(filePath)) {
    return [];
  }

  const fileContent = fs.readFileSync(filePath, "utf8");
  const lines = fileContent.split(/\r?\n/);
  const secrets = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const cleaned = trimmed.startsWith("export ")
      ? trimmed.slice("export ".length)
      : trimmed;
    const splitIndex = cleaned.indexOf("=");
    if (splitIndex === -1) {
      continue;
    }

    const key = cleaned.slice(0, splitIndex).trim();
    let value = cleaned.slice(splitIndex + 1).trim();
    if (!key || !value) {
      continue;
    }

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    secrets.push({ key, value });
  }

  return secrets;
}

function extractSecrets(json) {
  return Object.keys(secretMapping)
    .map((key) => {
      try {
        return { key, value: secretMapping[key](json) };
      } catch (error) {
        console.warn(
          `Warning: Could not extract secret ${key}: ${error.message}`,
        );
        return { key, value: null };
      }
    })
    .filter((item) => item.value !== null);
}

function mergeSecrets(baseSecrets, envSecrets) {
  const map = new Map(baseSecrets.map(({ key, value }) => [key, value]));
  envSecrets.forEach(({ key, value }) => {
    map.set(key, value);
  });
  return Array.from(map.entries()).map(([key, value]) => ({ key, value }));
}

function displaySecrets(secrets) {
  console.log("\n=== Environment Secrets ===\n");
  const maxKeyLength = Math.max(...secrets.map(({ key }) => key.length));

  secrets.forEach(({ key, value }) => {
    const paddedKey = key.padEnd(maxKeyLength, " ");
    const displayValue =
      typeof value === "string" && value.length > 100
        ? `${value.substring(0, 97)}...`
        : value;
    console.log(`${paddedKey}  |  ${displayValue}`);
  });

  console.log("\n===========================\n");
}

async function createEnvironment(octokit, { owner, repo, environment_name }) {
  await octokit.request(
    "PUT /repos/{owner}/{repo}/environments/{environment_name}",
    {
      owner,
      repo,
      environment_name,
      headers: { "X-GitHub-Api-Version": "2022-11-28" },
    },
  );
}

async function getPublicKey(octokit, { owner, repo, environment_name }) {
  const response = await octokit.request(
    "GET /repos/{owner}/{repo}/environments/{environment_name}/secrets/public-key",
    {
      owner,
      repo,
      environment_name,
      headers: { "X-GitHub-Api-Version": "2022-11-28" },
    },
  );
  return { key: response.data.key, keyId: response.data.key_id };
}

async function encryptSecret(secretValue, publicKey) {
  await sodium.ready;
  const binKey = sodium.from_base64(publicKey, sodium.base64_variants.ORIGINAL);
  const binSecret = sodium.from_string(secretValue);
  const encryptedBin = sodium.crypto_box_seal(binSecret, binKey);
  return sodium.to_base64(encryptedBin, sodium.base64_variants.ORIGINAL);
}

async function createSecret(octokit, params) {
  const { owner, repo, environment_name, secretName, encryptedValue, keyId } =
    params;
  await octokit.request(
    "PUT /repos/{owner}/{repo}/environments/{environment_name}/secrets/{secret_name}",
    {
      owner,
      repo,
      environment_name,
      secret_name: secretName,
      encrypted_value: encryptedValue,
      key_id: keyId,
      headers: { "X-GitHub-Api-Version": "2022-11-28" },
    },
  );
}

async function createEnvironmentVariable(octokit, params) {
  const { owner, repo, environment_name, variableName, value } = params;
  await octokit.request(
    "POST /repos/{owner}/{repo}/environments/{environment_name}/variables",
    {
      owner,
      repo,
      environment_name,
      name: variableName,
      value,
      headers: { "X-GitHub-Api-Version": "2022-11-28" },
    },
  );
}

async function run(args) {
  const config = parseArgs(args);
  if (!config) {
    return;
  }

  if (!config.github_token && !config.dry_run) {
    throw new Error(
      "GitHub token is required. Use --token or set GITHUB_TOKEN environment variable.",
    );
  }

  const log = (...messages) => {
    if (config.verbose) {
      console.log(...messages);
    }
  };

  const octokit = config.dry_run
    ? null
    : new Octokit({ auth: config.github_token });
  log(
    `Preparing secrets for ${config.owner}/${config.repo} environment "${config.environment_name}"...`,
  );
  const secretJson = loadSecretFile(config.secret_file);
  const baseSecrets = extractSecrets(secretJson);
  const envSecrets = loadEnvSecrets(config.env_file);
  const secrets = mergeSecrets(baseSecrets, envSecrets);

  if (config.dry_run) {
    console.log(`Environment: ${config.environment_name}`);
    console.log(`AIO_CLI_ENV: ${config.aio_env}`);
    console.log("\n=== Secrets ===\n");
    secrets.forEach(({ key }) => {
      console.log(key);
    });
    console.log("\n==============\n");
    return;
  }

  if (config.verbose) {
    displaySecrets(secrets);
  }

  log("Creating/updating GitHub environment...");
  await createEnvironment(octokit, config);
  log("Fetching environment public key...");
  const { key, keyId } = await getPublicKey(octokit, config);

  log('Setting environment variable "AIO_CLI_ENV"...');
  await createEnvironmentVariable(octokit, {
    owner: config.owner,
    repo: config.repo,
    environment_name: config.environment_name,
    variableName: "AIO_CLI_ENV",
    value: config.aio_env,
  });

  log(`Creating/updating ${secrets.length} secrets...`);
  let successCount = 0;
  for (const [
    index,
    { key: secretName, value: secretValue },
  ] of secrets.entries()) {
    log(`[${index + 1}/${secrets.length}] ${secretName}`);
    try {
      const encryptedValue = await encryptSecret(secretValue, key);
      await createSecret(octokit, {
        owner: config.owner,
        repo: config.repo,
        environment_name: config.environment_name,
        secretName,
        encryptedValue,
        keyId,
      });
      successCount++;
      log(`  OK ${secretName}`);
    } catch (error) {
      if (config.verbose) {
        console.error(`  FAIL ${secretName}: ${error.message}`);
      } else {
        console.error(`Failed secret "${secretName}": ${error.message}`);
      }
    }
  }

  console.log(
    `Completed: ${successCount} of ${secrets.length} secrets created/updated successfully.`,
  );
}

module.exports = {
  run,
};
