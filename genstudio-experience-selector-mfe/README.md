# GenStudio Experience Selector MFE 

Experience Selector is a Micro Frontend that provides an ExperienceSelectorDialog component for selecting GenStudio experiences. The component can be consumed in your application by importing the `renderExperienceSelectorWithSUSI` function from the standalone JavaScript bundle, which automatically loads the latest deployed Micro Frontend and presents a natural component interface.

## Overview

The GenStudio Experience Selector MFE allows users to:
- Browse and select GenStudio experiences
- Filter experiences by various criteria
- Support both single and multiple selection modes
- Handle authentication through SUSI (Sign-Up Sign-In) integration
- Provide a consistent UI across different frameworks

## Integration Options

The MFE can be integrated using two different approaches:

### ESM (ES Modules) - Recommended
```javascript
import { renderExperienceSelectorWithSUSI } from 'https://experience.adobe.com/solutions/GenStudio-experience-selector-mfe/static-assets/resources/@genstudio/experience-selector/esm/standalone.js';
```

### UMD (Universal Module Definition)
```html
<script src="https://experience.adobe.com/solutions/GenStudio-experience-selector-mfe/static-assets/resources/@genstudio/experience-selector/umd/standalone.js"></script>
```

## Configuration Properties

The `renderExperienceSelectorWithSUSI` function accepts a configuration object with the following properties:

| Property | Type | Required | Description                                                |
|----------|------|----------|------------------------------------------------------------|
| `locale` | `string` | Optional | Language locale (e.g., 'en-US')                            |
| `apiKey` | `string` | Required | API key for GenStudio services                             |
| `imsOrg` | `string` | Required | IMS Organization ID                                        |
| `env` | `'prod'` | Required | Environment                                                |
| `susiConfig` | `object` | Required | SUSI authentication configuration (see below)              |
| `isOpen` | `boolean` | Required | To show or hide the dialog. Should usually be true.        |
| `selectionType` | `'single' \| 'multiple'` | Optional | Wether a ingle or multiple experiences can be selected     |
| `customFilters` | `string[]` | Optional | Custom filter criteria combined with OR logic (e.g., `['genstudio-channel:email', 'genstudio-externalTemplateId=two-pods']`) |
| `dialogTitle` | `string` | Optional | Custom dialog title                                        |
| `onSelectionConfirmed` | `(selection: Experience[]) => void` | Required | Callback when selection is confirmed                       |
| `onDismiss` | `() => void` | Required | Callback when dialog is dismissed                          |

### SUSI Configuration

The `susiConfig` object includes the following properties:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `clientId` | `string` | Required | Client ID for SUSI authentication. Format: `genstudio-<CUSTOMER_NAME>-experienceselectormfe`. Provided by your Adobe support engineer during onboarding |
| `environment` | `'prod' \| 'stage'` | Optional | SUSI environment. Falls back to default if not provided |
| `scope` | `string` | Optional | OAuth scopes for authentication. Falls back to `'additional_info.projectedProductContext,read_organizations,AdobeID,openid'` if not provided |
| `locale` | `string` | Optional | Language locale for SUSI (e.g., 'en_US'). Falls back to dialog locale or default if not provided |
| `modalSettings` | `{ width?: number, height?: number, top?: number, left?: number }` | Optional | Modal display configuration. Falls back to defaults if not provided |
| `redirectUri` | `string` | Optional | Redirect URI after authentication. Falls back to `window.location.href` if not provided |

## Example Implementations

This repository includes working examples for different frameworks:

### React Example (`/react-js`)
A complete React application demonstrating integration with Vite build system.

### Vue.js Example (`/vue-js`) 
A Vue 3 application with Composition API integration.

### Vanilla JavaScript Examples (`/vanilla-js`)
Two vanilla JavaScript implementations:

#### ESM Version (`/vanilla-js/vanilla-esm`)
- Uses ES6 modules and modern JavaScript

#### UMD Version (`/vanilla-js/vanilla-umd-global-var`)
- Uses UMD bundle loaded via script tag

## Quick Start

1. **Choose your framework** from the available examples
2. **Navigate to the example directory**
3. **Install dependencies** (for React/Vue examples)
4. **Configure and call the function** with your API keys and IMS organization (configuration can be dynamic):
   ```javascript
   renderExperienceSelectorWithSUSI(dialogElement, {
     apiKey: 'exc_app',
     imsOrg: 'your-ims-org@AdobeOrg',  // Replace with your IMS Organization ID (press Ctrl+i in GenStudio to open User Data Debugger, then copy Current Org ID)
     env: 'prod',
     susiConfig: {
        clientId: 'genstudio-<CUSTOMER_NAME>-experienceselectormfe', // Provided by your Adobe support engineer during onboarding
     },
     customFilters: [
        // Multiple filters are combined with OR logic. Example filters:
        // 'genstudio-channel:email',
        // 'genstudio-externalTemplateId=two-pods',
     ],
     isOpen: true,
     onSelectionConfirmed: (selection) => {
       console.log('Selected experiences:', selection);
     },
     onDismiss: () => {
       console.log('Dialog dismissed');
     }
   });
   ```
5. **Run the development server**

## Authentication Flow

The Experience Selector handles authentication automatically through SUSI:

1. When the dialog opens, it checks for existing authentication
2. If not authenticated, it opens a SUSI login flow
3. After successful authentication, the experience selector is displayed
4. Users can browse and select experiences
5. Selected experiences are returned through the `onSelectionConfirmed` callback

