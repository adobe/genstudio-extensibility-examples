# React GenStudio Experience Selector Example

This example demonstrates how to integrate the GenStudio Experience Selector MFE into a React application using modern React patterns and Vite as the build tool.

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

3. **Update configuration** in `src/App.jsx`:
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

5. **Open your browser** and navigate to `https://localhost.corp.adobe.com:63002`

   > **Note**: You may need to accept the self-signed certificate warning in your browser.


## Code Structure

### App Component (`src/App.jsx`)

The main component demonstrates:

```javascript
import React, { useState, useRef } from 'react';
import { renderExperienceSelectorWithSUSI } from 'https://experience.adobe.com/solutions/GenStudio-experience-selector-mfe/static-assets/resources/@genstudio/experience-selector/esm/standalone.js';

function App() {
    const [result, setResult] = useState('');
    const dialogRef = useRef();

    // Handle selection confirmation
    function onSelectionConfirmed(experience) {
        dialogRef.current?.close();
        setResult(JSON.stringify(experience, null, 2));
    }

    // Configuration object
    const experienceSelectorProps = {
        imsOrg: 'your-ims-org@AdobeOrg',  // Replace with your IMS Organization ID (press Ctrl+i in GenStudio to open User Data Debugger, then copy Current Org ID)
        susiConfig: {
            clientId: 'genstudio-<CUSTOMER_NAME>-experienceselectormfe', // Provided by your Adobe support engineer during onboarding
        },
        isOpen: true,
        onDismiss: () => dialogRef.current?.close(),
        onSelectionConfirmed
    };

    // Open dialog function
    function openDialog() {
        renderExperienceSelectorWithSUSI(dialogRef.current, experienceSelectorProps);
        dialogRef.current?.showModal();
    }

    return (
        <div>
            <h1>Hello, this is React with GenStudio Experience Selector!</h1>
            <button onClick={openDialog}>
                Select a GenStudio Experience
            </button>
            <dialog ref={dialogRef}></dialog>
            <pre>{result}</pre>
        </div>
    );
}
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
| `locale` | Language locale | `'en-US'`|
| `apiKey` | GenStudio API key | Defaults to clientId |
| `env` | Environment | `'prod'` |
| `selectionType` | Selection mode | `'multiple'` |
| `customFilters` | Filter criteria | `[]` |
| `dialogTitle` | Custom dialog title | Default title |

### SUSI Configuration

```javascript
susiConfig: {
    clientId: 'genstudio-<CUSTOMER_NAME>-experienceselectormfe', // Provided by your Adobe support engineer during onboarding
}
```

## Troubleshooting

### Common Issues
1. **Authentication failures**: Verify your IMS organization and API key are correct
2. **Dialog not opening**: Check browser console for JavaScript errors

### Development Tips

- Use browser developer tools to inspect network requests
- Check the console for authentication and API errors

