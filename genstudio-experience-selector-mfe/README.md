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
import { renderExperienceSelectorWithSUSI } from "https://experience.adobe.com/solutions/GenStudio-experience-selector-mfe/static-assets/resources/@genstudio/experience-selector/esm/standalone.js";
```

### UMD (Universal Module Definition)

```html
<script src="https://experience.adobe.com/solutions/GenStudio-experience-selector-mfe/static-assets/resources/@genstudio/experience-selector/umd/standalone.js"></script>
```

## Configuration Properties

The `renderExperienceSelectorWithSUSI` function accepts a configuration object with the following properties:

| Property               | Type                                | Required | Description                                                                                                                                                                                          |
| ---------------------- | ----------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `locale`               | `string`                            | Optional | Language locale (e.g., 'en-US')                                                                                                                                                                      |
| `apiKey`               | `string`                            | Optional | API key for GenStudio services. Defaults to the clientID in the SUSI Configuration                                                                                                                   |
| `imsOrg`               | `string`                            | Required | IMS Organization ID                                                                                                                                                                                  |
| `env`                  | `'prod'`                            | Optional | Environment. Defaults to 'prod'                                                                                                                                                                      |
| `susiConfig`           | `object`                            | Required | SUSI authentication configuration (see below)                                                                                                                                                        |
| `isOpen`               | `boolean`                           | Required | To show or hide the dialog. Should usually be true.                                                                                                                                                  |
| `selectionType`        | `'single' \| 'multiple'`            | Optional | Whether a single or multiple experiences can be selected. Defaults to 'multiple'                                                                                                                     |
| `customFilters`        | `string[]`                          | Optional | Custom filter criteria. Multiple array elements are combined with OR logic. To combine with AND, use a single string (e.g., `['genstudio-channel:email AND genstudio-externalTemplateId:two-pods']`) |
| `dialogTitle`          | `string`                            | Optional | Custom dialog title                                                                                                                                                                                  |
| `onSelectionConfirmed` | `(selection: Experience[]) => void` | Required | Callback when selection is confirmed                                                                                                                                                                 |
| `onDismiss`            | `() => void`                        | Required | Callback when dialog is dismissed                                                                                                                                                                    |

### SUSI Configuration

The `susiConfig` object includes the following properties:

| Property        | Type                                                               | Required | Description                                                                                                                                             |
| --------------- | ------------------------------------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `clientId`      | `string`                                                           | Required | Client ID for SUSI authentication. Format: `genstudio-<CUSTOMER_NAME>-experienceselectormfe`. Provided by your Adobe support engineer during onboarding |
| `environment`   | `string`                                                           | Optional | SUSI environment. Defaults to 'prod'                                                                                                                    |
| `scope`         | `string`                                                           | Optional | OAuth scopes for authentication. Default: `'additional_info.projectedProductContext,read_organizations,AdobeID,openid'`                                 |
| `locale`        | `string`                                                           | Optional | Language locale for SUSI (e.g., 'en_US'). Falls back to dialog locale or default if not provided                                                        |
| `modalSettings` | `{ width?: number, height?: number, top?: number, left?: number }` | Optional | Modal display configuration. Falls back to defaults if not provided                                                                                     |
| `redirectUri`   | `string`                                                           | Optional | Redirect URI after authentication. Falls back to `window.location.href` if not provided                                                                 |

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
     imsOrg: "your-ims-org@AdobeOrg", // Replace with your IMS Organization ID (press Ctrl+i in GenStudio to open User Data Debugger, then copy Current Org ID)
     susiConfig: {
       clientId: "genstudio-<CUSTOMER_NAME>-experienceselectormfe", // Provided by your Adobe support engineer during onboarding
     },
     customFilters: [
       // Multiple array elements are combined with OR logic. Example filters:
       // 'genstudio-channel:email',
       // 'genstudio-externalTemplateId:two-pods',
       // To combine with AND, use a single string:
       // 'genstudio-channel:email AND genstudio-externalTemplateId:two-pods',
     ],
     isOpen: true,
     onSelectionConfirmed: (selection) => {
       console.log("Selected experiences:", selection);
     },
     onDismiss: () => {
       console.log("Dialog dismissed");
     },
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

## Selection Callback

When an Experience is selected in the MFE, and the "Use" button is clicked, a callback function must be invoked to pass the details of the selected experience.

### Output Format: HTML String + Pre-Signed URLs for Assets

**Description:**

The callback provides an HTML string representing the Experience. If the Experience includes Assets (e.g., images, videos), then HTML elements like `<img>` & `<video>` will include `src` attributes that contain pre-signed URLs for these assets. These pre-signed URLs will have an expiry time of 30 minutes, within which the experience should be consumed by the client application.

**Cons:**

Pre-signed URLs may expire, requiring the client to stream the Asset immediately.

### Output Schema

The `onSelectionConfirmed` callback receives an array of Experience objects with the following structure:

| Property           | Type     | Description                                                                                         |
| ------------------ | -------- | --------------------------------------------------------------------------------------------------- |
| `id`               | `string` | Unique identifier for the experience (URN format)                                                   |
| `content`          | `string` | Base64-encoded HTML string representing the experience                                              |
| `experienceFields` | `object` | Key-value pairs of editable fields in the experience                                                |
| `metadata`         | `object` | Metadata about the experience (e.g., channel, externalTemplateMetadata, externalAssetMetadata etc.) |
| `aspectVariants`   | `array`  | Array of aspect ratio variants for the experience                                                   |

**Experience Fields:**

Each field in `experienceFields` contains:

- `fieldName`: The name/identifier of the field
- `fieldValue`: The actual content/value of the field

**Aspect Variants:**

Each variant in `aspectVariants` contains:

- `aspectKey`: Unique identifier for the variant
- `aspectMetadata`: Metadata including `channel` and `aspectRatio`
- `content`: Base64-encoded HTML string for this specific aspect ratio

### Example JSON

See [sample-experiences.json](sample-experiences.json) for a real-world output including `externalTemplateId` and `externalAssetMetadata` metadata. 

### Simplified example JSON

```json
{
  "id": "urn:aaid:aem:<experience-id>",
  "content": "<base64 encoded html string>",
  "experienceFields": {
    "body": {
      "fieldName": "body",
      "fieldValue": "Sample body text!"
    },
    "headline": {
      "fieldName": "headline",
      "fieldValue": "Sample headline text!"
    },
    "cta": {
      "fieldName": "cta",
      "fieldValue": "Learn more"
    },
    "display_url": {
      "fieldName": "display_url",
      "fieldValue": "example.com"
    },
    "destination_url": {
      "fieldName": "destination_url",
      "fieldValue": "https://www.adobe.com"
    },
    "description": {
      "fieldName": "description",
      "fieldValue": "description"
    },
    "image": {
      "fieldName": "image",
      "fieldValue": "https://delivery-pxxxxxx-exxxxxx.adobeaemcloud.com/adobe/assets/urn:aaid:aem:<asset-id>/extra/path/to/image.png"
    },
    "image_name": {
      "fieldName": "image_name",
      "fieldValue": "test.png"
    }
  },
  "metadata": {
    "channel": "meta",
    // externalAssetMetadata is present only if experience has external assets
    // The URN asset ID for an external asset appears in the asset metadata and can also be found in the experience fields.
    "externalAssetMetadata": {
      "<Adobe-Org-ID>@AdobeOrg;acct:aem-pxxxxxx-exxxxxx@adobe.com;urn:aaid:aem:<asset-id>": {
        "assetId": "assets/man_bike_hill.png",
        "assetSignedPreviewUrl": "<s3-preview-url>",
        "assetSignedUrl": "<s3-url>",
        "assetSourceUrl": "<original-asset-url>",
        "extensionIconUrl": "<extension-icon-url>",
        "extensionId": "<extension-id>",
        "extensionSource": "<extension-source>",
        "isAssetDeliverable": false,
        "keywords": [
          "test-keyword-for-filtering-1",
          "test-keyword-for-filtering-2"
        ]
      }
    },
    // externalTemplateMetadata is present only if experience has external templates
    "externalTemplateMetadata": {
      "additionalMetadata": {
        "test": "test"
      },
      "extensionId": "<extension-id>",
      "id": "two-pod-duplicate-fields",
      "mapping": {
        "content": "body",
        "head": "headline",
        "btn": "cta"
      },
      "source": "External Template App"
    },
    // externalTemplateId and externalTemplateSource are present only if experience has external templates
    "externalTemplateId": "<external-template-id>",
    "externalTemplateSource": "<extension-source>"
  },
  "aspectVariants": [
    {
      "aspectKey": "Variant_meta_1x1_0",
      "aspectMetadata": {
        "channel": "meta",
        "aspectRatio": "1:1"
      },
      "content": "<base64 encoded html string for 1:1 aspect ratio>"
    },
    {
      "aspectKey": "Variant_meta_9x16_1",
      "aspectMetadata": {
        "channel": "meta",
        "aspectRatio": "9:16"
      },
      "content": "<base64 encoded html string for 9:16 aspect ratio>"
    }
  ]
}
```
