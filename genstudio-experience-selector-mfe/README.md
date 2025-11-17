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
| `customFilters` | `string[]` | Optional | Custom filter criteria. Multiple array elements are combined with OR logic. To combine with AND, use a single string (e.g., `['genstudio-channel:email AND genstudio-externalTemplateId:two-pods']`) |
| `dialogTitle` | `string` | Optional | Custom dialog title                                        |
| `onSelectionConfirmed` | `(selection: Experience[]) => void` | Required | Callback when selection is confirmed                       |
| `onDismiss` | `() => void` | Required | Callback when dialog is dismissed                          |

### SUSI Configuration

The `susiConfig` object includes the following properties:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `clientId` | `string` | Required | Client ID for SUSI authentication. Format: `genstudio-<CUSTOMER_NAME>-experienceselectormfe`. Provided by your Adobe support engineer during onboarding |
| `environment` | `'prod' \| 'stage'` | Required | SUSI environment |
| `scope` | `string` | Required | OAuth scopes for authentication. Default: `'additional_info.projectedProductContext,read_organizations,AdobeID,openid'` |
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
        environment: 'prod',
        scope: 'additional_info.projectedProductContext,read_organizations,AdobeID,openid',
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

## Selection Callback

When an Experience is selected in the MFE, and the "Use" button is clicked, a callback function must be invoked to pass the details of the selected experience.

### Output Format: HTML String + Pre-Signed URLs for Assets

**Description:**

The callback provides an HTML string representing the Experience. If the Experience includes Assets (e.g., images, videos), then HTML elements like `<img>` & `<video>` will include `src` attributes that contain pre-signed URLs for these assets. These pre-signed URLs will have an expiry time of 30 minutes, within which the experience should be consumed by the client application.

**Cons:**

Pre-signed URLs may expire, requiring the client to stream the Asset immediately.

### Output Schema

The `onSelectionConfirmed` callback receives an array of Experience objects with the following structure:

| Property | Type | Description |
|----------|------|-------------|
| `id` | `string` | Unique identifier for the experience (URN format) |
| `content` | `string` | Base64-encoded HTML string representing the experience |
| `experienceFields` | `object` | Key-value pairs of editable fields in the experience |
| `metadata` | `object` | Metadata about the experience (e.g., channel) |
| `aspectVariants` | `array` | Array of aspect ratio variants for the experience |

**Experience Fields:**

Each field in `experienceFields` contains:
- `fieldName`: The name/identifier of the field
- `fieldValue`: The actual content/value of the field

**Aspect Variants:**

Each variant in `aspectVariants` contains:
- `aspectKey`: Unique identifier for the variant
- `aspectMetadata`: Metadata including `channel` and `aspectRatio`
- `content`: Base64-encoded HTML string for this specific aspect ratio

### Sample JSON

```json
{
    "id": "urn:aaid:aem:d97f687f-1192-42c0-89a7-a3fee646ac2f",
    "content": "PCEtLSBGYWNlYm9vayAxOjEgQ2hyb21lIC0tPgo8IWRvY3R5cGUgaHRtbD4KPGh0bWwKICAgIHN0eWxlPSJtYXJnaW46IDA7IHBhZGRpbmc6IDA7IGJvcmRlcjogMDsgZm9udDogaW5oZXJpdDsgZm9udC1zaXplOiAxMDAlOyBib3gtc2l6aW5nOiBib3JkZXItYm94OyBtYXJnaW46IDBweDsgaGVpZ2h0OiAxMDAlOyIKPgogIDxoZWFkPgogICAgPG1ldGEgY2hhcnNldD0idXRmLTgiIC8+CiAgPC9oZWFkPgo8Ym9keQogIHN0eWxlPSJtYXJnaW46IDA7IHBhZGRpbmc6IDA7IGJvcmRlcjogMDsgZm9udDogaW5oZXJpdDsgZm9udC1zaXplOiAxMDAlOyBsaW5lLWhlaWdodDogMTsgYm94LXNpemluZzogYm9yZGVyLWJveDsgbWFyZ2luOiAwcHg7IGhlaWdodDogMTAwJTsiCj4KPGRpdgpzdHlsZT0iCiAgd2lkdGg6IDEwODBweDsKICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoMjU1IDI1NSAyNTUpOwogIGRpc3BsYXk6IGZsZXg7CiAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjsKICBmb250LXNpemU6IDQ2cHg7CiAgZm9udC1mYW1pbHk6IGluaXRpYWw7CiIKPgo8ZGl2CiAgc3R5bGU9IgogICAgZGlzcGxheTogZmxleDsKICAgIGZsZXgtZ3JvdzogMDsKICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47CiAgICBib3JkZXItcmFkaXVzOiAwLjVlbTsKICAgIG92ZXJmbG93OiBoaWRkZW47CiAgIgo+CiAgPGRpdiBkYXRhLWdzLXNlY3Rpb249ImNocm9tZSI+CiAgICA8ZGl2CiAgICAgIHN0eWxlPSIKICAgICAgICBwYWRkaW5nLXRvcDogMWVtOwogICAgICAgIHBhZGRpbmctYm90dG9tOiAwLjU4M2VtOwogICAgICAgIHBhZGRpbmctbGVmdDogMWVtOwogICAgICAgIHBhZGRpbmctcmlnaHQ6IDFlbTsKICAgICAgICBnYXA6IDFlbTsKICAgICAgICBmbGV4LWdyb3c6IDA7CiAgICAgICAgZGlzcGxheTogZmxleDsKICAgICAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uOwogICAgICAgIGZvbnQtc2l6ZTogMC44NzVlbTsKICAgICAgICBsaW5lLWhlaWdodDogMS4yNWVtOwogICAgICAgIGZvbnQtZmFtaWx5OiBBcmlhbCwgc2Fucy1zZXJpZjsKICAgICAgIgogICAgPgogICAgICA8ZGl2IHN0eWxlPSJkaXNwbGF5OiBmbGV4OyBnYXA6IDAuNWVtOyBhbGlnbi1pdGVtczogY2VudGVyIj4KICAgICAgICA8aW1nCiAgICAgICAgICBzcmM9ImRhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxpVkJPUncwS0dnb0FBQUFOU1VoRVVnQUFBQUVBQUFBQkNBSUFBQUNRZDFQZUFBQUFDWEJJV1hNQUFBc1RBQUFMRXdFQW1wd1lBQUFBREVsRVFWUUltV05nWjJjSEFBQXVBQmJIWkZROUFBQUFBRWxGVGtTdVFtQ0MiCiAgICAgICAgICBzdHlsZT0iCiAgICAgICAgICAgIHdpZHRoOiA4NXB4OyAKICAgICAgICAgICAgaGVpZ2h0OiA4NXB4OyAKICAgICAgICAgICAgYm9yZGVyLXJhZGl1czogOTk5OXB4OyAKICAgICAgICAgICAgcG9zaXRpb246IHN0YXRpYzsiCiAgICAgICAgLz4KICAgICAgICA8ZGl2CiAgICAgICAgICBzdHlsZT0iCiAgICAgICAgICAgIGRpc3BsYXk6IGZsZXg7CiAgICAgICAgICAgIGxpbmUtaGVpZ2h0OiAxZW07CiAgICAgICAgICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47CiAgICAgICAgICAiCiAgICAgICAgPgogICAgICAgICAgPGRpdiBzdHlsZT0iZm9udC13ZWlnaHQ6IDcwMDsgZm9udC1zaXplOiAxZW07IG1hcmdpbi1ib3R0b206IDAuMmVtIj5Zb3VyIEJyYW5kPC9kaXY+CiAgICAgICAgICA8ZGl2IHN0eWxlPSJjb2xvcjogcmdiKDE1NiAxNjMgMTc1KTsgZm9udC1zaXplOiAwLjg3NWVtIj5TcG9uc29yZWQ8L2Rpdj4KICAgICAgICA8L2Rpdj4KICAgICAgPC9kaXY+CiAgICAgIDxkaXYgc3R5bGU9ImZvbnQtd2VpZ2h0OiA1MDA7IGZvbnQtc2l6ZTogMS4yZW07IGxpbmUtaGVpZ2h0OiAxLjJlbSIgZGF0YS1ncy1lZGl0LXJlZmVyZW5jZT0iYm9keSI+CiAgICAgICAgU3RlcCBpbnRvIGEgd29ybGQgb2Ygd29uZGVyIHdpdGggb3VyIHBsYXlmdWwgZmFudGFzeSByb2xlLXBsYXkuIElnbml0ZSB5b3VyIGltYWdpbmF0aW9uIGFuZCBleHBsb3JlIGVuZGxlc3MgZnVuIQogICAgICA8L2Rpdj4KICAgIDwvZGl2PgogIDwvZGl2PgogIDxkaXYgCiAgICBzdHlsZT0iIAogICAgZmxleC1zaHJpbms6IDA7IAogICAgd2lkdGg6IDEwMCU7IAogICAgaGVpZ2h0OiAxMDgwcHg7IAogICAgb3ZlcmZsb3c6IGhpZGRlbjsgCiAgICBsaW5lLWhlaWdodDogaW5pdGlhbDsgCiAgICBwb3NpdGlvbjogcmVsYXRpdmU7IiAKICAgIGlkPSJkMDk1OGViMS03Njc4LTQwN2MtYmZjNS0zOWQ1YWM4NjMzMzIiCiAgICBkYXRhLWdzLXNlY3Rpb249ImJvZHkiCiAgPgogICAgPGRpdiBzdHlsZT0id2lkdGg6IDEwODBweDsgaGVpZ2h0OiAxMDgwcHg7IG92ZXJmbG93OiBoaWRkZW47Ij48aW1nIHNyYz0iaHR0cHM6Ly9kZWxpdmVyeS1wMTA2NjUzLWUzMjY3MDUtY21zdGcuYWRvYmVhZW1jbG91ZC5jb20vYWRvYmUvYXNzZXRzL3VybjphYWlkOmFlbTpjYTM5MjQyNy03MDVkLTQ4MjctYmE2Zi1lMmI1YjYyYTA1NjAvYXMvcmVuZGVyLnBuZz90b2tlbiYjeDNEOzNhMDVmYzdlODllNWQzODJiYmM1N2YxYTljMDExNzcxNjMwNTIyZDM0ZDNhNWUzYzI4ZDlhMjQ4MDIxYTcwMmUmYW1wO2V4cGlyeVRpbWUmI3gzRDsyMDI1LTExLTE3VDIzJTNBMTclM0EwNS43NTBaIiBoZWlnaHQ9IjEwMCUiIHdpZHRoPSIxMDAlIiBzdHlsZT0ib2JqZWN0LWZpdDogY292ZXI7Ii8+PC9kaXY+CiAgPC9kaXY+CiAgPGRpdiBkYXRhLWdzLXNlY3Rpb249ImNocm9tZSI+CiAgICA8ZGl2CiAgICAgIHN0eWxlPSIKICAgICAgICBwYWRkaW5nOiAxLjEyZW0gMWVtIDFlbSAxZW07CiAgICAgICAgZ2FwOiAxZW07CiAgICAgICAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuOwogICAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7CiAgICAgICAgZGlzcGxheTogZmxleDsKICAgICAgICBmb250LXNpemU6IDAuODc1ZW07CiAgICAgICAgbGluZS1oZWlnaHQ6IDEuMjVlbTsKICAgICAgICBmb250LWZhbWlseTogQXJpYWwsIHNhbnMtc2VyaWY7CiAgICAgICIKICAgID4KICAgICAgPGRpdj4KICAgICAgICA8ZGl2CiAgICAgICAgICBzdHlsZT0iZm9udC1zaXplOiAxZW07IGxpbmUtaGVpZ2h0OiAxZW07IGNvbG9yOiByZ2IoMTU2IDE2MyAxNzUpOyBtYXJnaW4tYm90dG9tOiAwLjJlbSIKICAgICAgICAgIGRhdGEtZ3MtZWRpdC1yZWZlcmVuY2U9ImRpc3BsYXlfdXJsIgogICAgICAgID4KICAgICAgICAgIGV4YW1wbGUuY29tCiAgICAgICAgPC9kaXY+CiAgICAgICAgPGRpdiBzdHlsZT0ib3ZlcmZsb3ctd3JhcDogYnJlYWstd29yZDsgZm9udC13ZWlnaHQ6IDUwMDsgZm9udC1zaXplOiAxLjJlbSIgZGF0YS1ncy1lZGl0LXJlZmVyZW5jZT0iaGVhZGxpbmUiPgogICAgICAgICAgQXdha2VuIHRoZSBtYWdpYyB3aXRoaW4KICAgICAgICA8L2Rpdj4KICAgICAgPC9kaXY+CiAgICAgIDxidXR0b24KICAgICAgICBzdHlsZT0iCiAgICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoMjQzLCAyNDQsIDI0Nik7CiAgICAgICAgICBwYWRkaW5nLXRvcDogMC4zNzVlbTsKICAgICAgICAgIHBhZGRpbmctYm90dG9tOiAwLjM3NWVtOwogICAgICAgICAgcGFkZGluZy1sZWZ0OiAwLjVlbTsKICAgICAgICAgIHBhZGRpbmctcmlnaHQ6IDAuNWVtOwogICAgICAgICAgbWF4LXdpZHRoOiA0NSU7CiAgICAgICAgICBjb2xvcjogcmdiKDEwNywgMTE0LCAxMjgpOwogICAgICAgICAgZm9udC1zaXplOiAxLjFlbTsKICAgICAgICAgIG92ZXJmbG93LXdyYXA6IGJyZWFrLXdvcmQ7CiAgICAgICAgICBmbGV4LXNocmluazogMDsKICAgICAgICAgIGJvcmRlcjogMDsKICAgICAgICAiCiAgICAgICAgZGF0YS1ncy1lZGl0LXJlZmVyZW5jZT0iY3RhIgogICAgICA+CiAgICAgICAgTGVhcm4gbW9yZQogICAgICA8L2J1dHRvbj4KICAgIDwvZGl2PgogIDwvZGl2Pgo8L2Rpdj4KPC9kaXY+CjwvYm9keT4KPC9odG1sPgo=",
    "experienceFields": {
        "body": {
            "fieldName": "body",
            "fieldValue": "Step into a world of wonder with our playful fantasy role-play. Ignite your imagination and explore endless fun!"
        },
        "headline": {
            "fieldName": "headline",
            "fieldValue": "Awaken the magic within"
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
            "fieldValue": "https://delivery-p106653-e326705-cmstg.adobeaemcloud.com/adobe/assets/urn:aaid:aem:ca392427-705d-4827-ba6f-e2b5b62a0560/original/as/aa5d839d4e3044e582033ef953b36833.png?token=3a05fc7e89e5d382bbc57f1a9c011771630522d34d3a5e3c28d9a248021a702e&expiryTime=2025-11-17T23%3A17%3A05.750Z"
        },
        "image_name": {
            "fieldName": "image_name",
            "fieldValue": "aa5d839d-4e30-44e5-8203-3ef953b36833.png"
        }
    },
    "metadata": {
        "channel": "meta"
    },
    "aspectVariants": [
        {
            "aspectKey": "Variant_meta_1x1_0",
            "aspectMetadata": {
                "channel": "meta",
                "aspectRatio": "1:1"
            },
            "content": "PCEtLSBGYWNlYm9vayAxOjEgQ2hyb21lIC0tPgo8IWRvY3R5cGUgaHRtbD4KPGh0bWwKICAgIHN0eWxlPSJtYXJnaW46IDA7IHBhZGRpbmc6IDA7IGJvcmRlcjogMDsgZm9udDogaW5oZXJpdDsgZm9udC1zaXplOiAxMDAlOyBib3gtc2l6aW5nOiBib3JkZXItYm94OyBtYXJnaW46IDBweDsgaGVpZ2h0OiAxMDAlOyIKPgogIDxoZWFkPgogICAgPG1ldGEgY2hhcnNldD0idXRmLTgiIC8+CiAgPC9oZWFkPgo8Ym9keQogIHN0eWxlPSJtYXJnaW46IDA7IHBhZGRpbmc6IDA7IGJvcmRlcjogMDsgZm9udDogaW5oZXJpdDsgZm9udC1zaXplOiAxMDAlOyBsaW5lLWhlaWdodDogMTsgYm94LXNpemluZzogYm9yZGVyLWJveDsgbWFyZ2luOiAwcHg7IGhlaWdodDogMTAwJTsiCj4KPGRpdgpzdHlsZT0iCiAgd2lkdGg6IDEwODBweDsKICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoMjU1IDI1NSAyNTUpOwogIGRpc3BsYXk6IGZsZXg7CiAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjsKICBmb250LXNpemU6IDQ2cHg7CiAgZm9udC1mYW1pbHk6IGluaXRpYWw7CiIKPgo8ZGl2CiAgc3R5bGU9IgogICAgZGlzcGxheTogZmxleDsKICAgIGZsZXgtZ3JvdzogMDsKICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47CiAgICBib3JkZXItcmFkaXVzOiAwLjVlbTsKICAgIG92ZXJmbG93OiBoaWRkZW47CiAgIgo+CiAgPGRpdiBkYXRhLWdzLXNlY3Rpb249ImNocm9tZSI+CiAgICA8ZGl2CiAgICAgIHN0eWxlPSIKICAgICAgICBwYWRkaW5nLXRvcDogMWVtOwogICAgICAgIHBhZGRpbmctYm90dG9tOiAwLjU4M2VtOwogICAgICAgIHBhZGRpbmctbGVmdDogMWVtOwogICAgICAgIHBhZGRpbmctcmlnaHQ6IDFlbTsKICAgICAgICBnYXA6IDFlbTsKICAgICAgICBmbGV4LWdyb3c6IDA7CiAgICAgICAgZGlzcGxheTogZmxleDsKICAgICAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uOwogICAgICAgIGZvbnQtc2l6ZTogMC44NzVlbTsKICAgICAgICBsaW5lLWhlaWdodDogMS4yNWVtOwogICAgICAgIGZvbnQtZmFtaWx5OiBBcmlhbCwgc2Fucy1zZXJpZjsKICAgICAgIgogICAgPgogICAgICA8ZGl2IHN0eWxlPSJkaXNwbGF5OiBmbGV4OyBnYXA6IDAuNWVtOyBhbGlnbi1pdGVtczogY2VudGVyIj4KICAgICAgICA8aW1nCiAgICAgICAgICBzcmM9ImRhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxpVkJPUncwS0dnb0FBQUFOU1VoRVVnQUFBQUVBQUFBQkNBSUFBQUNRZDFQZUFBQUFDWEJJV1hNQUFBc1RBQUFMRXdFQW1wd1lBQUFBREVsRVFWUUltV05nWjJjSEFBQXVBQmJIWkZROUFBQUFBRWxGVGtTdVFtQ0MiCiAgICAgICAgICBzdHlsZT0iCiAgICAgICAgICAgIHdpZHRoOiA4NXB4OyAKICAgICAgICAgICAgaGVpZ2h0OiA4NXB4OyAKICAgICAgICAgICAgYm9yZGVyLXJhZGl1czogOTk5OXB4OyAKICAgICAgICAgICAgcG9zaXRpb246IHN0YXRpYzsiCiAgICAgICAgLz4KICAgICAgICA8ZGl2CiAgICAgICAgICBzdHlsZT0iCiAgICAgICAgICAgIGRpc3BsYXk6IGZsZXg7CiAgICAgICAgICAgIGxpbmUtaGVpZ2h0OiAxZW07CiAgICAgICAgICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47CiAgICAgICAgICAiCiAgICAgICAgPgogICAgICAgICAgPGRpdiBzdHlsZT0iZm9udC13ZWlnaHQ6IDcwMDsgZm9udC1zaXplOiAxZW07IG1hcmdpbi1ib3R0b206IDAuMmVtIj5Zb3VyIEJyYW5kPC9kaXY+CiAgICAgICAgICA8ZGl2IHN0eWxlPSJjb2xvcjogcmdiKDE1NiAxNjMgMTc1KTsgZm9udC1zaXplOiAwLjg3NWVtIj5TcG9uc29yZWQ8L2Rpdj4KICAgICAgICA8L2Rpdj4KICAgICAgPC9kaXY+CiAgICAgIDxkaXYgc3R5bGU9ImZvbnQtd2VpZ2h0OiA1MDA7IGZvbnQtc2l6ZTogMS4yZW07IGxpbmUtaGVpZ2h0OiAxLjJlbSIgZGF0YS1ncy1lZGl0LXJlZmVyZW5jZT0iYm9keSI+CiAgICAgICAgU3RlcCBpbnRvIGEgd29ybGQgb2Ygd29uZGVyIHdpdGggb3VyIHBsYXlmdWwgZmFudGFzeSByb2xlLXBsYXkuIElnbml0ZSB5b3VyIGltYWdpbmF0aW9uIGFuZCBleHBsb3JlIGVuZGxlc3MgZnVuIQogICAgICA8L2Rpdj4KICAgIDwvZGl2PgogIDwvZGl2PgogIDxkaXYgCiAgICBzdHlsZT0iIAogICAgZmxleC1zaHJpbms6IDA7IAogICAgd2lkdGg6IDEwMCU7IAogICAgaGVpZ2h0OiAxMDgwcHg7IAogICAgb3ZlcmZsb3c6IGhpZGRlbjsgCiAgICBsaW5lLWhlaWdodDogaW5pdGlhbDsgCiAgICBwb3NpdGlvbjogcmVsYXRpdmU7IiAKICAgIGlkPSJkMDk1OGViMS03Njc4LTQwN2MtYmZjNS0zOWQ1YWM4NjMzMzIiCiAgICBkYXRhLWdzLXNlY3Rpb249ImJvZHkiCiAgPgogICAgPGRpdiBzdHlsZT0id2lkdGg6IDEwODBweDsgaGVpZ2h0OiAxMDgwcHg7IG92ZXJmbG93OiBoaWRkZW47Ij48aW1nIHNyYz0iaHR0cHM6Ly9kZWxpdmVyeS1wMTA2NjUzLWUzMjY3MDUtY21zdGcuYWRvYmVhZW1jbG91ZC5jb20vYWRvYmUvYXNzZXRzL3VybjphYWlkOmFlbTpjYTM5MjQyNy03MDVkLTQ4MjctYmE2Zi1lMmI1YjYyYTA1NjAvYXMvcmVuZGVyLnBuZz90b2tlbiYjeDNEOzNhMDVmYzdlODllNWQzODJiYmM1N2YxYTljMDExNzcxNjMwNTIyZDM0ZDNhNWUzYzI4ZDlhMjQ4MDIxYTcwMmUmYW1wO2V4cGlyeVRpbWUmI3gzRDsyMDI1LTExLTE3VDIzJTNBMTclM0EwNS43NTBaIiBoZWlnaHQ9IjEwMCUiIHdpZHRoPSIxMDAlIiBzdHlsZT0ib2JqZWN0LWZpdDogY292ZXI7Ii8+PC9kaXY+CiAgPC9kaXY+CiAgPGRpdiBkYXRhLWdzLXNlY3Rpb249ImNocm9tZSI+CiAgICA8ZGl2CiAgICAgIHN0eWxlPSIKICAgICAgICBwYWRkaW5nOiAxLjEyZW0gMWVtIDFlbSAxZW07CiAgICAgICAgZ2FwOiAxZW07CiAgICAgICAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuOwogICAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7CiAgICAgICAgZGlzcGxheTogZmxleDsKICAgICAgICBmb250LXNpemU6IDAuODc1ZW07CiAgICAgICAgbGluZS1oZWlnaHQ6IDEuMjVlbTsKICAgICAgICBmb250LWZhbWlseTogQXJpYWwsIHNhbnMtc2VyaWY7CiAgICAgICIKICAgID4KICAgICAgPGRpdj4KICAgICAgICA8ZGl2CiAgICAgICAgICBzdHlsZT0iZm9udC1zaXplOiAxZW07IGxpbmUtaGVpZ2h0OiAxZW07IGNvbG9yOiByZ2IoMTU2IDE2MyAxNzUpOyBtYXJnaW4tYm90dG9tOiAwLjJlbSIKICAgICAgICAgIGRhdGEtZ3MtZWRpdC1yZWZlcmVuY2U9ImRpc3BsYXlfdXJsIgogICAgICAgID4KICAgICAgICAgIGV4YW1wbGUuY29tCiAgICAgICAgPC9kaXY+CiAgICAgICAgPGRpdiBzdHlsZT0ib3ZlcmZsb3ctd3JhcDogYnJlYWstd29yZDsgZm9udC13ZWlnaHQ6IDUwMDsgZm9udC1zaXplOiAxLjJlbSIgZGF0YS1ncy1lZGl0LXJlZmVyZW5jZT0iaGVhZGxpbmUiPgogICAgICAgICAgQXdha2VuIHRoZSBtYWdpYyB3aXRoaW4KICAgICAgICA8L2Rpdj4KICAgICAgPC9kaXY+CiAgICAgIDxidXR0b24KICAgICAgICBzdHlsZT0iCiAgICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoMjQzLCAyNDQsIDI0Nik7CiAgICAgICAgICBwYWRkaW5nLXRvcDogMC4zNzVlbTsKICAgICAgICAgIHBhZGRpbmctYm90dG9tOiAwLjM3NWVtOwogICAgICAgICAgcGFkZGluZy1sZWZ0OiAwLjVlbTsKICAgICAgICAgIHBhZGRpbmctcmlnaHQ6IDAuNWVtOwogICAgICAgICAgbWF4LXdpZHRoOiA0NSU7CiAgICAgICAgICBjb2xvcjogcmdiKDEwNywgMTE0LCAxMjgpOwogICAgICAgICAgZm9udC1zaXplOiAxLjFlbTsKICAgICAgICAgIG92ZXJmbG93LXdyYXA6IGJyZWFrLXdvcmQ7CiAgICAgICAgICBmbGV4LXNocmluazogMDsKICAgICAgICAgIGJvcmRlcjogMDsKICAgICAgICAiCiAgICAgICAgZGF0YS1ncy1lZGl0LXJlZmVyZW5jZT0iY3RhIgogICAgICA+CiAgICAgICAgTGVhcm4gbW9yZQogICAgICA8L2J1dHRvbj4KICAgIDwvZGl2PgogIDwvZGl2Pgo8L2Rpdj4KPC9kaXY+CjwvYm9keT4KPC9odG1sPgo="
        },
        {
            "aspectKey": "Variant_meta_9x16_1",
            "aspectMetadata": {
                "channel": "meta",
                "aspectRatio": "9:16"
            },
            "content": "PCEtLSBGYWNlYm9vayA5OjE2IENocm9tZSAtLT4KPCFkb2N0eXBlIGh0bWw+CjxodG1sCiAgICBzdHlsZT0ibWFyZ2luOiAwOyBwYWRkaW5nOiAwOyBib3JkZXI6IDA7IGZvbnQ6IGluaGVyaXQ7IGZvbnQtc2l6ZTogMTAwJTsgYm94LXNpemluZzogYm9yZGVyLWJveDsgbWFyZ2luOiAwcHg7IGhlaWdodDogMTAwJTsiCj4KICA8aGVhZD4KICAgIDxtZXRhIGNoYXJzZXQ9InV0Zi04IiAvPgogIDwvaGVhZD4KPGJvZHkKICBzdHlsZT0ibWFyZ2luOiAwOyBwYWRkaW5nOiAwOyBib3JkZXI6IDA7IGZvbnQ6IGluaGVyaXQ7IGZvbnQtc2l6ZTogMTAwJTsgbGluZS1oZWlnaHQ6IDE7IGJveC1zaXppbmc6IGJvcmRlci1ib3g7IG1hcmdpbjogMHB4OyBoZWlnaHQ6IDEwMCU7Igo+CjxkaXYKc3R5bGU9IgogIHdpZHRoOiAxMDgwcHg7CiAgYmFja2dyb3VuZC1jb2xvcjogcmdiKDI1NSAyNTUgMjU1KTsKICBkaXNwbGF5OiBmbGV4OwogIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47CiAgZm9udC1zaXplOiA0NnB4OwogIGZvbnQtZmFtaWx5OiBpbml0aWFsOwoiCj4KPGRpdgogIHN0eWxlPSIKICAgIGRpc3BsYXk6IGZsZXg7CiAgICBmbGV4LWdyb3c6IDA7CiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uOwogICAgYm9yZGVyLXJhZGl1czogMC41ZW07CiAgICBvdmVyZmxvdzogaGlkZGVuOwogICIKPgogIDxkaXYgZGF0YS1ncy1zZWN0aW9uPSJjaHJvbWUiPgogICAgPGRpdgogICAgICBzdHlsZT0iCiAgICAgICAgcGFkZGluZy10b3A6IDFlbTsKICAgICAgICBwYWRkaW5nLWJvdHRvbTogMC41ODNlbTsKICAgICAgICBwYWRkaW5nLWxlZnQ6IDFlbTsKICAgICAgICBwYWRkaW5nLXJpZ2h0OiAxZW07CiAgICAgICAgZ2FwOiAxZW07CiAgICAgICAgZmxleC1ncm93OiAwOwogICAgICAgIGRpc3BsYXk6IGZsZXg7CiAgICAgICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjsKICAgICAgICBmb250LXNpemU6IDAuODc1ZW07CiAgICAgICAgbGluZS1oZWlnaHQ6IDEuMjVlbTsKICAgICAgICBmb250LWZhbWlseTogQXJpYWwsIHNhbnMtc2VyaWY7CiAgICAgICIKICAgID4KICAgICAgPGRpdiBzdHlsZT0iZGlzcGxheTogZmxleDsgZ2FwOiAwLjVlbTsgYWxpZ24taXRlbXM6IGNlbnRlciI+CiAgICAgICAgPGltZwogICAgICAgICAgc3JjPSJkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQUFFQUFBQUJDQUlBQUFDUWQxUGVBQUFBQ1hCSVdYTUFBQXNUQUFBTEV3RUFtcHdZQUFBQURFbEVRVlFJbVdOZ1oyY0hBQUF1QUJiSFpGUTlBQUFBQUVsRlRrU3VRbUNDIgogICAgICAgICAgc3R5bGU9IgogICAgICAgICAgICB3aWR0aDogODVweDsgCiAgICAgICAgICAgIGhlaWdodDogODVweDsgCiAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDk5OTlweDsgCiAgICAgICAgICAgIHBvc2l0aW9uOiBzdGF0aWM7IgogICAgICAgIC8+CiAgICAgICAgPGRpdgogICAgICAgICAgc3R5bGU9IgogICAgICAgICAgICBkaXNwbGF5OiBmbGV4OwogICAgICAgICAgICBsaW5lLWhlaWdodDogMWVtOwogICAgICAgICAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uOwogICAgICAgICAgIgogICAgICAgID4KICAgICAgICAgIDxkaXYgc3R5bGU9ImZvbnQtd2VpZ2h0OiA3MDA7IGZvbnQtc2l6ZTogMWVtOyBtYXJnaW4tYm90dG9tOiAwLjJlbSI+WW91ciBCcmFuZDwvZGl2PgogICAgICAgICAgPGRpdiBzdHlsZT0iY29sb3I6IHJnYigxNTYgMTYzIDE3NSk7IGZvbnQtc2l6ZTogMC44NzVlbSI+U3BvbnNvcmVkPC9kaXY+CiAgICAgICAgPC9kaXY+CiAgICAgIDwvZGl2PgogICAgICA8ZGl2IHN0eWxlPSJmb250LXdlaWdodDogNTAwOyBmb250LXNpemU6IDEuMmVtOyBsaW5lLWhlaWdodDogMS4yZW0iIGRhdGEtZ3MtZWRpdC1yZWZlcmVuY2U9ImJvZHkiPgogICAgICAgIFN0ZXAgaW50byBhIHdvcmxkIG9mIHdvbmRlciB3aXRoIG91ciBwbGF5ZnVsIGZhbnRhc3kgcm9sZS1wbGF5LiBJZ25pdGUgeW91ciBpbWFnaW5hdGlvbiBhbmQgZXhwbG9yZSBlbmRsZXNzIGZ1biEKICAgICAgPC9kaXY+CiAgICA8L2Rpdj4KICA8L2Rpdj4KICA8ZGl2IAogICAgc3R5bGU9IiAKICAgIGZsZXgtc2hyaW5rOiAwOyAKICAgIHdpZHRoOiAxMDAlOyAKICAgIGhlaWdodDogMTkyMHB4OyAKICAgIG92ZXJmbG93OiBoaWRkZW47IAogICAgbGluZS1oZWlnaHQ6IGluaXRpYWw7IAogICAgcG9zaXRpb246IHJlbGF0aXZlOyIgCiAgICBpZD0iZjI4MzM3ODUtMjZhNC00ZGQzLTk4OGEtMTM1ZDE5OTJhMzUzIgogICAgZGF0YS1ncy1zZWN0aW9uPSJib2R5IgogID4KICAgIDxkaXYgc3R5bGU9IndpZHRoOiAxMDgwcHg7IGhlaWdodDogMTkyMHB4OyBvdmVyZmxvdzogaGlkZGVuOyI+PGltZyBzcmM9Imh0dHBzOi8vZGVsaXZlcnktcDEwNjY1My1lMzI2NzA1LWNtc3RnLmFkb2JlYWVtY2xvdWQuY29tL2Fkb2JlL2Fzc2V0cy91cm46YWFpZDphZW06Y2EzOTI0MjctNzA1ZC00ODI3LWJhNmYtZTJiNWI2MmEwNTYwL2FzL3JlbmRlci5wbmc/dG9rZW4mI3gzRDszYTA1ZmM3ZTg5ZTVkMzgyYmJjNTdmMWE5YzAxMTc3MTYzMDUyMmQzNGQzYTVlM2MyOGQ5YTI0ODAyMWE3MDJlJmFtcDtleHBpcnlUaW1lJiN4M0Q7MjAyNS0xMS0xN1QyMyUzQTE3JTNBMDUuNzUwWiIgaGVpZ2h0PSIxMDAlIiB3aWR0aD0iMTAwJSIgc3R5bGU9Im9iamVjdC1maXQ6IGNvdmVyOyIvPjwvZGl2PgogIDwvZGl2PgogIDxkaXYgZGF0YS1ncy1zZWN0aW9uPSJjaHJvbWUiPgogICAgPGRpdgogICAgICBzdHlsZT0iCiAgICAgICAgcGFkZGluZzogMS4xMmVtIDFlbSAxZW0gMWVtOwogICAgICAgIGdhcDogMWVtOwogICAgICAgIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjsKICAgICAgICBhbGlnbi1pdGVtczogY2VudGVyOwogICAgICAgIGRpc3BsYXk6IGZsZXg7CiAgICAgICAgZm9udC1zaXplOiAwLjg3NWVtOwogICAgICAgIGxpbmUtaGVpZ2h0OiAxLjI1ZW07CiAgICAgICAgZm9udC1mYW1pbHk6IEFyaWFsLCBzYW5zLXNlcmlmOwogICAgICAiCiAgICA+CiAgICAgIDxkaXY+CiAgICAgICAgPGRpdgogICAgICAgICAgc3R5bGU9ImZvbnQtc2l6ZTogMWVtOyBsaW5lLWhlaWdodDogMWVtOyBjb2xvcjogcmdiKDE1NiAxNjMgMTc1KTsgbWFyZ2luLWJvdHRvbTogMC4yZW0iCiAgICAgICAgICBkYXRhLWdzLWVkaXQtcmVmZXJlbmNlPSJkaXNwbGF5X3VybCIKICAgICAgICA+CiAgICAgICAgICBleGFtcGxlLmNvbQogICAgICAgIDwvZGl2PgogICAgICAgIDxkaXYgc3R5bGU9Im92ZXJmbG93LXdyYXA6IGJyZWFrLXdvcmQ7IGZvbnQtd2VpZ2h0OiA1MDA7IGZvbnQtc2l6ZTogMS4yZW0iIGRhdGEtZ3MtZWRpdC1yZWZlcmVuY2U9ImhlYWRsaW5lIj4KICAgICAgICAgIEF3YWtlbiB0aGUgbWFnaWMgd2l0aGluCiAgICAgICAgPC9kaXY+CiAgICAgIDwvZGl2PgogICAgICA8YnV0dG9uCiAgICAgICAgc3R5bGU9IgogICAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogcmdiKDI0MywgMjQ0LCAyNDYpOwogICAgICAgICAgcGFkZGluZy10b3A6IDAuMzc1ZW07CiAgICAgICAgICBwYWRkaW5nLWJvdHRvbTogMC4zNzVlbTsKICAgICAgICAgIHBhZGRpbmctbGVmdDogMC41ZW07CiAgICAgICAgICBwYWRkaW5nLXJpZ2h0OiAwLjVlbTsKICAgICAgICAgIG1heC13aWR0aDogNDUlOwogICAgICAgICAgY29sb3I6IHJnYigxMDcsIDExNCwgMTI4KTsKICAgICAgICAgIGZvbnQtc2l6ZTogMS4xZW07CiAgICAgICAgICBvdmVyZmxvdy13cmFwOiBicmVhay13b3JkOwogICAgICAgICAgZmxleC1zaHJpbms6IDA7CiAgICAgICAgICBib3JkZXI6IDA7CiAgICAgICAgIgogICAgICAgIGRhdGEtZ3MtZWRpdC1yZWZlcmVuY2U9ImN0YSIKICAgICAgPgogICAgICAgIExlYXJuIG1vcmUKICAgICAgPC9idXR0b24+CiAgICA8L2Rpdj4KICA8L2Rpdj4KPC9kaXY+CjwvZGl2Pgo8L2JvZHk+CjwvaHRtbD4K"
        }
    ]
}
```

