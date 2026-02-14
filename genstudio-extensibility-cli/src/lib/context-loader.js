const fs = require("node:fs");
const path = require("node:path");
const yaml = require("js-yaml");

const contextPath = path.resolve(__dirname, "..", "..", "config", "context.yaml");

const readContextConfig = () => {
  if (!fs.existsSync(contextPath)) {
    throw new Error(
      `Missing context config: ${contextPath}. Create it from config/context.example.yaml.`,
    );
  }

  const raw = fs.readFileSync(contextPath, "utf8");
  const parsed = yaml.load(raw) || {};

  const orgs = parsed.orgs || {};
  const extensions = parsed.extensions || {};

  const ORG_MAP = Object.fromEntries(
    Object.entries(orgs).map(([key, org]) => [key, { ...org }]),
  );

  const EXTENSION_MAP = Object.fromEntries(
    Object.entries(extensions).map(([extensionKey, entries]) => {
      const normalizedEntries = (entries || []).map((entry) => {
        const orgKey = entry.org;
        const org = ORG_MAP[orgKey];
        if (!org) {
          throw new Error(
            `Unknown org key "${orgKey}" in extension "${extensionKey}"`,
          );
        }

        return {
          org,
          published: Boolean(entry.published),
          workspace: entry.workspace || {},
        };
      });

      return [extensionKey, normalizedEntries];
    }),
  );

  return { ORG_MAP, EXTENSION_MAP };
};

module.exports = readContextConfig();
