# Vue.js GenStudio Experience Selector Example

This example demonstrates how to integrate the GenStudio Experience Selector MFE into a Vue.js 3 application using the Composition API and Vite as the build tool.


## Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager
- Valid GenStudio API credentials

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Create SSL certificates** (required for HTTPS):
   ```bash
   # Generate private key
   openssl genrsa -out key.pem 2048

   # Generate certificate for localhost
   openssl req -new -x509 -key key.pem -out cert.pem -days 365 -subj "/CN=localhost"
   ```

3. **Update configuration** in `App.vue`:
   ```javascript
   const experienceSelectorProps = {
     imsOrg: 'your-ims-org@AdobeOrg',  // Replace with your IMS Organization ID (press Ctrl+i in GenStudio to open User Data Debugger, then copy Current Org ID)
     susiConfig: {
       clientId: 'genstudio-<CUSTOMER_NAME>-experienceselectormfe', // Provided by your Adobe support engineer during onboarding
     },
     // ... other configuration
   };
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser** and navigate to `https://localhost.corp.adobe.com:63001`

   > **Note**: You may need to accept the self-signed certificate warning in your browser.

## Code Structure

### App Component (`App.vue`)

The main component demonstrates Vue 3 Composition API integration:

```vue
<script setup>
import { ref } from 'vue'
import { renderExperienceSelectorWithSUSI } from 'https://experience.adobe.com/solutions/GenStudio-experience-selector-mfe/static-assets/resources/@genstudio/experience-selector/esm/standalone.js'

// Reactive references
const dialogRef = ref();
const resultRef = ref();

// Handle selection confirmation
function onSelectionConfirmed(experience) {
    dialogRef.value?.close();
    resultRef.value.textContent = JSON.stringify(experience, null, 2);
}

// Configuration object
const experienceSelectorProps = {
    imsOrg: 'your-ims-org@AdobeOrg',  // Replace with your IMS Organization ID (press Ctrl+i in GenStudio to open User Data Debugger, then copy Current Org ID)
    susiConfig: {
        clientId: 'genstudio-<CUSTOMER_NAME>-experienceselectormfe', // Provided by your Adobe support engineer during onboarding
    },
    isOpen: true,
    onDismiss: () => dialogRef.value?.close(),
    onSelectionConfirmed
};

// Open dialog function
function openDialog() {
    renderExperienceSelectorWithSUSI(dialogRef.value, experienceSelectorProps);
    dialogRef.value?.showModal();
}
</script>

<template>
    <h1>Hello, this is Vue with GenStudio Experience Selector!</h1>
    <p style="text-align: center">
        <button @click="openDialog">Select a GenStudio Experience</button>
    </p>
    <dialog ref="dialogRef"></dialog>
    <pre ref="resultRef"></pre>
</template>

<style scoped>
/* Component styles */
</style>
```


## Configuration Options

### Required Properties

| Property | Description | Example |
|----------|-------------|---------|
| `imsOrg` | IMS Organization ID | `'your-ims-org@AdobeOrg'` |
| `susiConfig` | Authentication configuration | See SUSI Config below |
| `isOpen` | Dialog visibility state | `true` |
| `onSelectionConfirmed` | Callback when selection is confirmed | `(selection) => {}` |
| `onDismiss` | Callback when dialog is dismissed | `() => {}` |

### Optional Properties

| Property | Description | Default |
|----------|-------------|---------|
| `locale` | Language locale | `'en-US'` |
| `apiKey` | GenStudio API key | Defaults to clientId |
| `env` | Environment | `'prod'` |
| `selectionType` | Selection mode | `'multiple'` |
| `customFilters` | Filter criteria | `[]` |
| `dialogTitle` | Custom dialog title | Default title |

### SUSI Integration
```javascript
susiConfig: {
    clientId: 'genstudio-<CUSTOMER_NAME>-experienceselectormfe', // Provided by your Adobe support engineer during onboarding
}
```



### Custom Filters

Add custom filtering capabilities (optional):

```javascript
const experienceSelectorProps = {
    // ... other required props
    customFilters: ['genstudio-channel:email', 'genstudio-type:template'],
    selectionType: 'multiple',
    dialogTitle: 'Select Email Templates'
};
```


## Troubleshooting


### Development Tips

- Use Vue DevTools browser extension for debugging
- Check the browser console for network and authentication errors


