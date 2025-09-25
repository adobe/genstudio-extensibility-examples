# Vanilla JavaScript GenStudio Experience Selector Examples

This directory contains two vanilla JavaScript implementations demonstrating how to integrate the GenStudio Experience Selector MFE without any framework dependencies.

## Examples Overview

### 1. ESM Version (`/vanilla-esm`)
- **Modern approach** using ES6 modules
- **Recommended** for modern browsers

### 2. UMD Version (`/vanilla-umd-global-var`)
- **Traditional approach** using script tags
- **Fallback option** for older browsers or simpler setups

## Prerequisites

- Modern web browser
- Local web server (for ESM version)
- Valid GenStudio API credentials

## Quick Start

### ESM Version Setup

1. **Navigate to the ESM directory**:
   ```bash
   cd vanilla-esm
   ```

2. **Update configuration** in `app.js`:
   ```javascript
   const experienceSelectorProps = {
     locale: 'en-US',
     apiKey: 'exc_app',        
     imsOrg: 'your-ims-org@AdobeOrg',  // Replace with your IMS Org
     env: 'stage', // or 'prod'
     susiConfig: {
       clientId: 'genstudio',
       environment: 'stg1', // or 'prod'
       scope: 'additional_info.projectedProductContext,additional_info.ownerOrg,AdobeID,openid,session,read_organizations,ab.manage',
       locale: 'en_US',
       modalSettings: {
         width: 500,
         height: 700,
       },
     },
     // ... other configuration
   };
   ```
3. **Creating Self-Signed Certificates (Needed for HTTPS)**:
To run the app over HTTPS, first create self-signed certificates:
    ```bash
    # Generate private key
    openssl genrsa -out key.pem 2048

    # Generate certificate for localhost
    openssl req -new -x509 -key key.pem -out cert.pem -days 365 -subj "/CN=localhost"
    ```

4. **Start a local server**:
   ```bash
   # HTTPS (with self-signed certificates): (recommended)
   npx http-server -S -C "$(pwd)/cert.pem" -K "$(pwd)/key.pem" -p 8080
   
   or

   # Using Python
   python -m http.server 8080

   or
   
   # Using Node.js
   npx serve -p 8080
   ```

5. **Open browser** and navigate to `localhost.corp.adobe.com:8080` (HTTP) or `https://localhost:8080` (HTTPS) to view the app

### UMD Version Setup

1. **Navigate to the UMD directory**:
   ```bash
   cd vanilla-umd-global-var
   ```

2. **Update configuration** in `app.js`:
   ```javascript
   const experienceSelectorProps = {
     locale: 'en-US',
     apiKey: 'exc_app',         
     imsOrg: 'your-ims-org@AdobeOrg',  // Replace with your IMS Org
     env: 'stage', // or 'prod'
     susiConfig: {
       clientId: 'genstudio',
       environment: 'stg1', // or 'prod'
       scope: 'additional_info.projectedProductContext,additional_info.ownerOrg,AdobeID,openid,session,read_organizations,ab.manage',
       locale: 'en_US',
       modalSettings: {
         width: 500,
         height: 700,
       },
     },
     // ... other configuration
   };
   ```

3. **Open HTML file directly** in your browser or serve via local server


## Code Structure

### ESM Version (`vanilla-esm/app.js`)

```javascript
import { renderExperienceSelectorWithSUSI } from "https://experience-stage.adobe.com/solutions/GenStudio-experience-selector-mfe/static-assets/resources/@genstudio/experience-selector/esm/standalone.js"

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('experience-selector-button');
    button.addEventListener('click', openDialog);
});

const dialogRef = document.getElementById('experience-selector-root');
const resultRef = document.getElementById('experience-selector-result');

function onSelectionConfirmed(experience) {
    dialogRef?.close();
    resultRef.textContent = JSON.stringify(experience, null, 2);
}

const experienceSelectorProps = {
    locale: 'en-US',
    apiKey: 'exc_app',          
    imsOrg: 'your-ims-org@AdobeOrg',  // Replace with your IMS Org
    env: 'stage', // or 'prod'
    susiConfig: {
        clientId: 'genstudio',
        environment: 'stg1', // or 'prod'
        scope: 'additional_info.projectedProductContext,additional_info.ownerOrg,AdobeID,openid,session,read_organizations,ab.manage',
        locale: 'en_US',
        modalSettings: {
            width: 500,
            height: 700,
        },
    },
    selectionType: 'multiple',
    dialogTitle: 'Select Experiences',
    isOpen: true,
    onDismiss: () => dialogRef?.close(),
    onSelectionConfirmed
};

function openDialog() {
    renderExperienceSelectorWithSUSI(dialogRef, experienceSelectorProps);
    dialogRef?.showModal();
}
```

### UMD Version (`vanilla-umd-global-var/app.js`)

```javascript
// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('experience-selector-button');
    button.addEventListener('click', openDialog);
});

const dialogRef = document.getElementById('experience-selector-root');
const resultRef = document.getElementById('experience-selector-result');

function onSelectionConfirmed(experience) {
    dialogRef?.close();
    resultRef.textContent = JSON.stringify(experience, null, 2);
}

const experienceSelectorProps = {
    locale: 'en-US',
    apiKey: 'exc_app',          
    imsOrg: 'your-ims-org@AdobeOrg',  // Replace with your IMS Org
    env: 'stage', // or 'prod'
    susiConfig: {
        clientId: 'genstudio',
        environment: 'stg1', // or 'prod'
        scope: 'additional_info.projectedProductContext,additional_info.ownerOrg,AdobeID,openid,session,read_organizations,ab.manage',
        locale: 'en_US',
        modalSettings: {
            width: 500,
            height: 700,
        },
    },
    isOpen: true,
    onDismiss: () => dialogRef?.close(),
    onSelectionConfirmed
};

function openDialog() {
    // Note: Using global variable from UMD bundle
    GenStudioExperienceSelector.renderExperienceSelectorWithSUSI(
        dialogRef,
        experienceSelectorProps
    );
    dialogRef?.showModal();
}
```


## Configuration Options

### Required Properties

| Property | Description | Example |
|----------|-------------|---------|
| `locale` | Language locale | `'en-US'` |
| `apiKey` | GenStudio API key | `'exc_app'` |
| `imsOrg` | IMS Organization ID | `'36031A56669DEACD0A49402F@AdobeOrg'` |
| `env` | Environment | `'stage'` or `'prod'` |

### Optional Properties

| Property | Description | Default |
|----------|-------------|---------|
| `selectionType` | Selection mode | `'single'` |
| `customFilters` | Filter criteria | `[]` |
| `dialogTitle` | Custom dialog title | Default title |
| `isOpen` | Initial dialog state | `false` |

### SUSI Configuration

```javascript
susiConfig: {
    clientId: 'genstudio',
    environment: 'stg1', // 'stg1' for stage, 'prod' for production
    scope: 'additional_info.projectedProductContext,additional_info.ownerOrg,AdobeID,openid,session,read_organizations,ab.manage',
    locale: 'en_US',
    modalSettings: {
        width: 500,
        height: 700,
    },
}
```

## HTML Structure

Both examples use the same HTML structure:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vanilla JS GenStudio Experience Selector</title>
    <style>
        /* Styling for the example */
    </style>
    <!-- UMD version includes script tag here -->
</head>
<body>
    <h1>Hello, this is Vanilla JS with GenStudio Experience Selector!</h1>
    <p>
        <button id="experience-selector-button">Select a GenStudio Experience</button>
    </p>
    <dialog id="experience-selector-root"></dialog>
    <pre id="experience-selector-result"></pre>

    <!-- Script loading differs between versions -->
</body>
</html>
```

## Using the Experience Selector

1. **Click the button** to open the Experience Selector dialog
2. **Authentication flow**:
   - If not signed in, SUSI login popup/redirect will appear
   - After successful authentication, the selector dialog opens
3. **Browse and select** experiences based on your filters
4. **Confirm selection** to receive the selected experience data
5. **View results** in the formatted JSON output below the button



## Troubleshooting

### Common Issues

1. **Authentication failures**:
   - **Solution**: Verify API key and IMS organization are correct
   - **Check**: Environment setting matches your credentials

2. **Dialog not opening**:
   - **Solution**: Check browser console for JavaScript errors
   - **Verify**: DOM elements exist before calling functions


### Development Tips

- **Use browser developer tools** to inspect network requests and console errors
- **Test authentication flow** in incognito mode to simulate new users


## Advanced Usage

### Custom Filters

```javascript
const experienceSelectorProps = {
    // ... other props
    customFilters: ['genstudio-channel:email', 'genstudio-type:template'],
    selectionType: 'multiple',
    dialogTitle: 'Select Email Templates'
};
```

### Multiple Selection Handling

```javascript
function onSelectionConfirmed(experiences) {
    dialogRef?.close();
    
    if (Array.isArray(experiences)) {
        resultRef.textContent = `Selected ${experiences.length} experiences:\n${JSON.stringify(experiences, null, 2)}`;
    } else {
        resultRef.textContent = `Selected experience:\n${JSON.stringify(experiences, null, 2)}`;
    }
}
```
