# GenStudio Extension Reference Application

**_GenStudio Extension Reference Application_** is an Adobe GenStudio web extension designed to help you configure, display, and validate content experiences against a set of claims libraries. This project offers a customizable React-based UI panel where you can select experiences, view their data fields, and run claims compliance checks. Quickly adapt the extension for your organization's needs by editing configuration constants and UI components.

## Setup Environment

- Populate the `.env` file in the project root and fill it as shown [below](#env)

### Repo Structure

```
genstudio-create-validation/
├── src/
│   └── genstudiopem/
│       ├── actions/                        # 🚚 Serverless IO Action code
│       │   └── (optional)                  # Add serverless functions here
│       │                                   # for backend processing/API calls
│       │
│       ├── web-src/                        # 🖼️ UI code
│       │   └── src/
│       │       ├── app/                    # ⚠️ DO NOT MODIFY
│       │       │   ├── index.tsx           # App entry point and routing
│       │       │   └── ExtensionRegistration.tsx  # Extension registration logic
│       │       │
│       │       ├── components/             # ✅ MODIFY HERE
│       │       │   ├── RightPanel.tsx      # Main panel component
│       │       │   └── ExperiencePanel/    # Experience panel components
│       │       │
│       │       ├── hooks/                  # Custom React hooks
│       │       │
│       │       ├── Constants.ts            # 🔧 START HERE - Configure first
│       │       └── index.tsx               # React root
│       │
│       └── ext.config.yaml                 # Extension configuration
│
├── extension-manifest.json                 # Extension manifest
├── app.config.yaml                         # App configuration
└── package.json                            # Dependencies
```

#### Quick Start Guide

> ‼️ **_DO NOT_** **modify app folder**
> Modifying these files under `src/genstudiopem/web-src/src/app/` may break the extension's integration with GenStudio.

1. **Configure Constants** (`src/genstudiopem/web-src/src/Constants.ts`)

   - Set your `EXTENSION_ID`, `EXTENSION_LABEL`, and `ICON_DATA_URI`
   - Configure `APP_METADATA` with your supported channels and validation options
   - This is the **first file** you should customize for your use case

2. **Customize Components** (`src/genstudiopem/web-src/src/components/`)

   - Modify `RightPanel.tsx` to change the main panel behavior
   - Update `ExperiencePanel/` components to customize the experience UI
   - Add your own components as needed

3. **(Optional) Add IO Actions** (`src/genstudiopem/actions/`)

   - Create serverless functions for backend logic, API integrations, or data processing
   - Actions are deployed to Adobe I/O Runtime and can be called from your UI
   - See [Action Dependencies](#action-dependencies) for configuration details

## Local Dev

- `aio app run` to start your local Dev server
- App will run on `localhost:9080` by default

#### With IO Action

By default the UI will be served locally but actions will be deployed and served from Adobe I/O Runtime.

To start a local serverless stack and also run your actions locally use the `aio app dev` option.

## Test & Coverage

- Run `aio app test` to run unit tests for ui and actions
- Run `aio app test --e2e` to run e2e tests

## Deploy & Cleanup

- `aio app deploy` to build and deploy all actions on Runtime and static files to CDN
- `aio app undeploy` to undeploy the app

## Config

### `.env`

You can generate this file using the command `aio app use`.

```bash
# This file must **not** be committed to source control

## please provide your Adobe I/O Runtime credentials
# AIO_RUNTIME_AUTH=
# AIO_RUNTIME_NAMESPACE=
```

### `app.config.yaml`

- Main configuration file that defines an application's implementation.
- More information on this file, application configuration, and extension configuration
  can be found [here](https://developer.adobe.com/app-builder/docs/guides/appbuilder-configuration/#appconfigyaml)

#### Action Dependencies

- You have two options to resolve your actions' dependencies:

  1. **Packaged action file**: Add your action's dependencies to the root
     `package.json` and install them using `npm install`. Then set the `function`
     field in `app.config.yaml` to point to the **entry file** of your action
     folder. We will use `webpack` to package your code and dependencies into a
     single minified js file. The action will then be deployed as a single file.
     Use this method if you want to reduce the size of your actions.

  2. **Zipped action folder**: In the folder containing the action code add a
     `package.json` with the action's dependencies. Then set the `function`
     field in `app.config.yaml` to point to the **folder** of that action. We will
     install the required dependencies within that directory and zip the folder
     before deploying it as a zipped action. Use this method if you want to keep
     your action's dependencies separated.

## Debugging in VS Code

While running your local server (`aio app run`), both UI and actions can be debugged, to do so open the vscode debugger
and select the debugging configuration called `WebAndActions`.
Alternatively, there are also debug configs for only UI and each separate action.
