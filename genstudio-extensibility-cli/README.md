# genstudio-extensibility-cli

CLI utilities for GenStudio extensibility workflows.

## Prerequisites

- Node.js 18+ (recommended)
- npm
- Adobe `aio` CLI for workspace download commands
- `GITHUB_TOKEN` for `create-gh-env`

## Install

```bash
npm install
```

## First-time config (YAML)

This project now reads org/workspace config from `config/context.yaml`.

- `config/context.yaml` is intentionally gitignored (local-only).
- A sample schema is committed at `config/context.example.yaml`.

Create your local config:

```bash
cp config/context.example.yaml config/context.yaml
```

Then edit `config/context.yaml` with your real orgs/extensions/workspace URLs.

Expected structure:

```yaml
orgs:
  ORG_KEY:
    name: Org Name
    aioEnv: stage
    id: EXAMPLE@AdobeOrg

extensions:
  EXTENSION_KEY:
    - org: ORG_KEY
      published: true
      workspace:
        Production: https://developer.adobe.com/...
        Stage: https://developer-stage.adobe.com/...
```

## Run commands

### Local (without global link)

```bash
npm exec -- gs-ext --help
npm exec -- gs-ext get-commands
npm exec -- gs-ext get-table
npm exec -- gs-ext get-all-commands
npm exec -- gs-ext generate-workflows
npm exec -- gs-ext create-gh-env --help
```

### Global command (optional)

```bash
npm link
gs-ext --help
```

## Commands

- `gs-ext get-commands`
  - Interactive selection for app/org/workspace
  - Outputs download + GitHub env command snippets
- `gs-ext get-table`
  - Prints HTML table of deployments
- `gs-ext get-all-commands`
  - Prints command snippets for all app/org/workspace combinations
- `gs-ext generate-workflows`
  - Generates workflow files in `.github/workflows`
- `gs-ext create-gh-env [options]`
  - Creates/updates GitHub environment variable + secrets from `console.json` and optional `.env.local`

`create-gh-env` options:

- `--env <name>` environment name
- `--file <path>` path to `console.json`
- `--env-file <path>` path to optional env file (default `./.env.local`)
- `--token <token>` GitHub token (or set `GITHUB_TOKEN`)
- `--owner <owner>` repo owner (default `adobe`)
- `--repo <repo>` repo name (default `genstudio-uix-examples`)
- `--aio-env <stage|prod>` sets `AIO_CLI_ENV` variable in GitHub environment
- `--verbose` or `-v` print detailed progress logs

Example:

```bash
export GITHUB_TOKEN=your_token
npm exec -- gs-ext create-gh-env \
  --env "Genstudio Engineering - workspace Production" \
  --file ./console.json \
  --aio-env stage
```
