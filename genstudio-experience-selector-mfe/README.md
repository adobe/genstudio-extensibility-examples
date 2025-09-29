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
import { renderExperienceSelectorWithSUSI } from 'https://experience-stage.adobe.com/solutions/GenStudio-experience-selector-mfe/static-assets/resources/@genstudio/experience-selector/esm/standalone.js';
```

### UMD (Universal Module Definition)
```html
<script src="https://experience-stage.adobe.com/solutions/GenStudio-experience-selector-mfe/static-assets/resources/@genstudio/experience-selector/umd/standalone.js"></script>
```

## Configuration Properties

The `renderExperienceSelectorWithSUSI` function accepts a configuration object with the following properties:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `locale` | string | No | Language locale (e.g., 'en-US') |
| `apiKey` | string | Yes | API key for GenStudio services |
| `imsOrg` | string | Yes | IMS Organization ID |
| `env` | string | Yes | Environment ('stage', 'prod') |
| `susiConfig` | object | Yes | SUSI authentication configuration |
| `isOpen` | boolean | No | Initial dialog state |
| `selectionType` | string | No | 'single' or 'multiple' selection mode |
| `customFilters` | array | No | Custom filter criteria |
| `dialogTitle` | string | No | Custom dialog title |
| `onSelectionConfirmed` | function | Yes | Callback when selection is confirmed |
| `onDismiss` | function | Yes | Callback when dialog is dismissed |

### SUSI Configuration

The `susiConfig` object may include:

```javascript
{
  clientId: 'genstudio',
  environment: 'stg1', // or 'prod'
  scope: 'additional_info.projectedProductContext,additional_info.ownerOrg,AdobeID,openid,session,read_organizations,ab.manage',
  locale: 'en_US',
  modalSettings: {
    width: 500,
    height: 700
  }
}
```

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
4. **Update configuration** with your API keys and IMS organization:
   ```javascript
   const experienceSelectorProps = {
     locale: 'en-US',
     apiKey: 'exc_app',           
     imsOrg: 'your-ims-org@AdobeOrg',  // Replace with your IMS Org
     env: 'stage', // or 'prod'
     // ... other configuration
   };
   ```
5. **Run the development server**

## Authentication Flow

The Experience Selector handles authentication automatically through SUSI:

1. When the dialog opens, it checks for existing authentication
2. If not authenticated, it opens a SUSI login flow
3. After successful authentication, the experience selector is displayed
4. Users can browse and select experiences
5. Selected experiences are returned through the `onSelectionConfirmed` callback

