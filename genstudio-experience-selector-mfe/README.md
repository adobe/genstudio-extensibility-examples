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
| `apiKey` | `string` | Optional | API key for GenStudio services. Defaults to the clientID in the SUSI Configuration |
| `imsOrg` | `string` | Required | IMS Organization ID                                        |
| `env` | `'prod'` | Optional | Environment. Defaults to 'prod'                            |
| `susiConfig` | `object` | Required | SUSI authentication configuration (see below)              |
| `isOpen` | `boolean` | Required | To show or hide the dialog. Should usually be true.        |
| `selectionType` | `'single' \| 'multiple'` | Optional | Whether a single or multiple experiences can be selected. Defaults to 'multiple' |
| `customFilters` | `string[]` | Optional | Custom filter criteria. Multiple array elements are combined with OR logic. To combine with AND, use a single string (e.g., `['genstudio-channel:email AND genstudio-externalTemplateId:two-pods']`) |
| `dialogTitle` | `string` | Optional | Custom dialog title                                        |
| `onSelectionConfirmed` | `(selection: Experience[]) => void` | Required | Callback when selection is confirmed                       |
| `onDismiss` | `() => void` | Required | Callback when dialog is dismissed                          |

### SUSI Configuration

The `susiConfig` object includes the following properties:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `clientId` | `string` | Required | Client ID for SUSI authentication. Format: `genstudio-<CUSTOMER_NAME>-experienceselectormfe`. Provided by your Adobe support engineer during onboarding |
| `environment` | `string` | Optional | SUSI environment. Defaults to 'prod' |
| `scope` | `string` | Optional | OAuth scopes for authentication. Default: `'additional_info.projectedProductContext,read_organizations,AdobeID,openid'` |
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
     imsOrg: 'your-ims-org@AdobeOrg',  // Replace with your IMS Organization ID (press Ctrl+i in GenStudio to open User Data Debugger, then copy Current Org ID)
     susiConfig: {
        clientId: 'genstudio-<CUSTOMER_NAME>-experienceselectormfe', // Provided by your Adobe support engineer during onboarding
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
| `metadata` | `object` | Metadata about the experience (e.g., channel, externalTemplateMetadata, externalAssetMetadata etc.) |
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
        "channel": "meta",
        // externalAssetMetadata is present only if experience has external assets
        "externalAssetMetadata": {
            "36031A56669DEACD0A49402F@AdobeOrg;acct:aem-cmstg-p106653-e326705@adobe.com;urn:aaid:aem:cf126281-c115-4f83-81d4-5fe26f04c758": {
                "assetId": "assets/man_bike_hill.png",
                "assetSignedPreviewUrl": "https://genstudio-uix-external-dam-demo.s3.us-east-1.amazonaws.com/thumbnails/man_bike_hill.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAU6GD2JLYS2TWIMO7%2F20251111%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20251111T003440Z&X-Amz-Expires=3600&X-Amz-Signature=ece36fe4147b85f2de80452cad88fea84bb215057e5c3da0e0ce00913bc3080f&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject",
                "assetSignedUrl": "https://genstudio-uix-external-dam-demo.s3.us-east-1.amazonaws.com/assets/man_bike_hill.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAU6GD2JLYS2TWIMO7%2F20251111%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20251111T003440Z&X-Amz-Expires=3600&X-Amz-Signature=a83ee4289aef1fbb057e864f15f5983fdf70ab60a934e30ca6e7ac195b3ed6a8&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject",
                "assetSourceUrl": "https://genstudio-uix-external-dam-demo.s3.us-east-1.amazonaws.com/assets/man_bike_hill.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAU6GD2JLYS2TWIMO7%2F20251111%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20251111T003440Z&X-Amz-Expires=3600&X-Amz-Signature=a83ee4289aef1fbb057e864f15f5983fdf70ab60a934e30ca6e7ac195b3ed6a8&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject",
                "extensionIconUrl": "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iMjRweCIgaGVpZ2h0PSIyNHB4IiB2aWV3Qm94PSIwIDAgMjQgMjQiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8IS0tIEdlbmVyYXRvcjogU2tldGNoIDY0ICg5MzUzNykgLSBodHRwczovL3NrZXRjaC5jb20gLS0+CiAgICA8dGl0bGU+SWNvbi1BcmNoaXRlY3R1cmUvMTYvQXJjaF9BbWF6b24tUzMtU3RhbmRhcmRfMTY8L3RpdGxlPgogICAgPGRlc2M+Q3JlYXRlZCB3aXRoIFNrZXRjaC48L2Rlc2M+CiAgICA8ZGVmcz4KICAgICAgICA8bGluZWFyR3JhZGllbnQgeDE9IjAlIiB5MT0iMTAwJSIgeDI9IjEwMCUiIHkyPSIwJSIgaWQ9ImxpbmVhckdyYWRpZW50LTEiPgogICAgICAgICAgICA8c3RvcCBzdG9wLWNvbG9yPSIjMUI2NjBGIiBvZmZzZXQ9IjAlIj48L3N0b3A+CiAgICAgICAgICAgIDxzdG9wIHN0b3AtY29sb3I9IiM2Q0FFM0UiIG9mZnNldD0iMTAwJSI+PC9zdG9wPgogICAgICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgICA8L2RlZnM+CiAgICA8ZyBpZD0iSWNvbi1BcmNoaXRlY3R1cmUvMTYvQXJjaF9BbWF6b24tUzMtU3RhbmRhcmRfMTYiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgICAgIDxnIGlkPSJJY29uLUFyY2hpdGVjdHVyZS1CRy8xNi9TdG9yYWdlIiBmaWxsPSJ1cmwoI2xpbmVhckdyYWRpZW50LTEpIj4KICAgICAgICAgICAgPHJlY3QgaWQ9IlJlY3RhbmdsZSIgeD0iMCIgeT0iMCIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0Ij48L3JlY3Q+CiAgICAgICAgPC9nPgogICAgICAgIDxwYXRoIGQ9Ik0xOC4xNTg5NDk1LDEzLjM1MzU3MTkgTDE4LjE4NjM2NTcsMTMuMTg3ODk1NiBDMTguMzQ4ODMyMiwxMy4yODA5MDY5IDE4LjQ4MTg1MTYsMTMuMzY0MjI5NCAxOC41ODY0MzkzLDEzLjQzMzk4NzkgQzE4LjQ2NzYzNTgsMTMuNDE1NTc5NCAxOC4zMjA0MDA2LDEzLjM4NzQ4MjIgMTguMTU4OTQ5NSwxMy4zNTM1NzE5IEwxOC4xNTg5NDk1LDEzLjM1MzU3MTkgWiBNMTEuOTIwMjM4NiwxMS43OTU2MzM2IEMxMS45MjAyMzg2LDEyLjA2MjA3MjEgMTEuNjkyNzg1NSwxMi4yODAwNjcyIDExLjQxMjUzMSwxMi4yODAwNjcyIEMxMS4xMzMyOTE4LDEyLjI4MDA2NzIgMTAuOTA0ODIzNCwxMi4wNjIwNzIxIDEwLjkwNDgyMzQsMTEuNzk1NjMzNiBDMTAuOTA0ODIzNCwxMS41MjgyMjYzIDExLjEzMzI5MTgsMTEuMzExMjAwMSAxMS40MTI1MzEsMTEuMzExMjAwMSBDMTEuNjkyNzg1NSwxMS4zMTEyMDAxIDExLjkyMDIzODYsMTEuNTI4MjI2MyAxMS45MjAyMzg2LDExLjc5NTYzMzYgTDExLjkyMDIzODYsMTEuNzk1NjMzNiBaIE0xNi4zMzgzMTAxLDE4LjE2NjkwMzUgQzE2LjI1MTk5OTgsMTguMjE0Mzc4IDE2LjA2NDE0OCwxOC4yODEyMjk4IDE1LjkwNjc1ODYsMTguMzM4MzkzIEwxNS42NDE3MzUzLDE4LjQzNTI3OTcgQzE1LjM3MDYxOTQsMTguNTM3MDEwNyAxNS4wNDg3MzI4LDE4LjYyOTA1MzEgMTQuNjgxMTUyNSwxOC43MDg1MDAyIEMxMy43NjExODYzLDE4LjkxMDk5MzQgMTIuNDg3ODU1NiwxOS4wMzExMzI5IDExLjI3NzQ4MDcsMTkuMDMxMTMyOSBDNy40Nzg4MTI0NywxOS4wMzExMzI5IDYuNTE2MTk4ODYsMTguNDAzMzA3MSA2LjQ4MTY3NDc1LDE4LjE5ODg3NjEgTDUuMjEwMzc0OTIsOC44MzQ3NzU4NyBDNi42MjY4NzkxMiw5LjUyOTQ1MzU2IDkuMDc1MDQ1MTYsOS44NTc4OTk1IDExLjQxMjUzMSw5Ljg1Nzg5OTUgQzEzLjUxMTM5NDIsOS44NTc4OTk1IDE2LjI5NTY2MjYsOS41NjA0NTczMSAxNy44ODM3NzIsOC44MTkyNzQgTDE3LjE3NjAyNzYsMTMuMTAwNjk3NiBDMTUuNjkyNTA2LDEyLjY2NTY3NjMgMTMuOTIzNjUyNywxMS44ODE4NjI4IDEyLjg3MjY5OCwxMS40MDIyNzM2IEMxMi42OTA5Mzg3LDEwLjc5MTg4NzQgMTIuMTA5MTA1OCwxMC4zNDIzMzMgMTEuNDEyNTMxLDEwLjM0MjMzMyBDMTAuNTcyNzgyNiwxMC4zNDIzMzMgOS44ODk0MDgxNSwxMC45OTM0MTE3IDkuODg5NDA4MTUsMTEuNzk1NjMzNiBDOS44ODk0MDgxNSwxMi41OTY4ODY3IDEwLjU3Mjc4MjYsMTMuMjQ4OTM0MiAxMS40MTI1MzEsMTMuMjQ4OTM0MiBDMTIuMDEyNjQxMywxMy4yNDg5MzQyIDEyLjUyNzQ1NjgsMTIuOTEyNzM3NCAxMi43NzYyMzM2LDEyLjQzMTIxMDQgQzEzLjkwNjM5MDcsMTIuOTQwODM0NSAxNS41ODY5MDI4LDEzLjY2MzYwOTQgMTcuMDE1NTkyLDE0LjA2NzYyNjkgTDE2LjMzODMxMDEsMTguMTY2OTAzNSBaIE0xMS40MTI1MzEsNS45Njg4NjcwNyBDMTUuNzQ0MjkyMiw1Ljk2ODg2NzA3IDE4LjA4Nzg3MDUsNi45OTE5OTA3IDE4LjExNTI4NjcsNy40MjAyMjk5NCBMMTguMTExMjI1LDcuNDQzNDgyNzUgQzE4LjA2MjQ4NTEsNy44NzU1OTc0NyAxNS43MjQ5OTkzLDguODg5MDMyNDIgMTEuNDEyNTMxLDguODg5MDMyNDIgQzcuMzA0MTYxMDYsOC44ODkwMzI0MiA1LjA1NDAwMDk4LDcuOTM5NTQyNjkgNS4wMjE1MDc2OSw3LjQ0MDU3NjE1IEw1LjAxOTQ3Njg2LDcuNDIxMTk4ODEgQzUuMDM3NzU0MzMsNi45MjQxNyA3LjI5MDk2MDY2LDUuOTY4ODY3MDcgMTEuNDEyNTMxLDUuOTY4ODY3MDcgTDExLjQxMjUzMSw1Ljk2ODg2NzA3IFogTTE4LjM1Njk1NTUsMTIuMTYwODk2NSBMMTkuMTI5Njg2NSw3LjUwNDUyMTM4IEwxOS4xMjk2ODY1LDcuNTAzNTUyNTEgQzE5LjEzMTcxNzMsNy40NzgzNjE5NyAxOS4xMzU3NzksNy40NTUxMDkxNiAxOS4xMzU3NzksNy40Mjg5NDk3NSBDMTkuMTM1Nzc5LDUuNjQ2MjM0MzQgMTQuNTE3NjcwNiw1IDExLjQxMjUzMSw1IEM3Ljg0MjMzMTExLDUgNCw1Ljc2MDU2MDY1IDQsNy40Mjg5NDk3NSBDNCw3LjQ1MDI2NDgyIDQuMDAzMDQ2MjUsNy40NzA2MTEwMyA0LjAwNDA2MTY2LDcuNDkwOTU3MjQgTDUuNDc3NDI5MTEsMTguMzM5MzYxOCBDNS41NDc0OTI3NiwxOC43NTAxNjE1IDUuNzYwNzI5OTUsMjAgMTEuMjc3NDgwNywyMCBDMTIuNTU5OTUwMSwyMCAxMy45MTc1NjAyLDE5Ljg3MTE0MDcgMTQuOTA4NjA1NSwxOS42NTMxNDU2IEMxNS4zMjM5MTAzLDE5LjU2MjA3MjEgMTUuNjk1NTUyMywxOS40NTU0OTY3IDE2LjAxMzM3NzIsMTkuMzM2MzI2MSBMMTYuMjY2MjE1NiwxOS4yNDQyODM3IEMxNi43OTMyMTYxLDE5LjA1NDM4NTcgMTcuMzM3NDc4NiwxOC44NTg2NzQ2IDE3LjMzMjQwMTYsMTguMzM3NDI0MSBMMTguMDAwNTQ0OCwxNC4zMTE3ODE0IEMxOC40NTQ0MzU0LDE0LjQwNTc2MTUgMTguODAxNzA3NCwxNC40NDkzNjA1IDE5LjA1MjUxNDksMTQuNDQ5MzYwNSBDMTkuNTIxNjM2NywxNC40NDkzNjA1IDE5LjcwMDM0OTgsMTQuMzE4NTYzNSAxOS44MjQyMzA1LDE0LjE3ODA3NzggQzE5Ljk3MjQ4MTEsMTQuMDA5NDk0OSAyMC4wMjkzNDQzLDEzLjc5NzMxMyAxOS45ODU2ODE1LDEzLjU4MDI4NjggQzE5Ljg5NzM0MDQsMTMuMTQ4MTcyMSAxOS40MjgyMTg1LDEyLjczNTQzNDcgMTguMzU2OTU1NSwxMi4xNjA4OTY1IEwxOC4zNTY5NTU1LDEyLjE2MDg5NjUgWiIgaWQ9IkFtYXpvbi1TMy1TdGFuZGFyZC1JY29uXzE2X1NxdWlkIiBmaWxsPSIjRkZGRkZGIj48L3BhdGg+CiAgICA8L2c+Cjwvc3ZnPg==",
                "extensionId": "genstudio-external-s3-dam",
                "extensionSource": "External S3 DAM",
                "isAssetDeliverable": false,
                "keywords": ["S3Asset"]
            }
        },
        // externalTemplateMetadata is present only if experience has external templates
        "externalTemplateMetadata": {
            "additionalMetadata": {
                "test": "test"
            },
            "extensionId": "257324-GSTemplateImport",
            "id": "two-pod-duplicate-fields",
            "mapping": {
                "btn": "cta",
                "btn1": "cta",
                "btn2": "cta",
                "content": "body",
                "content1": "body",
                "content2": "body",
                "else": "other",
                "else1": "other",
                "else2": "other",
                "head": "headline",
                "head1": "headline",
                "head2": "headline",
                "pod1_btn": "cta",
                "pod1_btn1": "cta",
                "pod1_btn2": "cta",
                "pod1_content": "body",
                "pod1_content1": "body",
                "pod1_content2": "body",
                "pod1_else": "other",
                "pod1_else1": "other",
                "pod1_else2": "other",
                "pod1_head": "headline",
                "pod1_head1": "headline",
                "pod1_head2": "headline",
                "pod1_subhead": "sub_headline",
                "pod1_subhead1": "sub_headline",
                "pod1_subhead2": "sub_headline",
                "pod2_btn": "cta",
                "pod2_btn1": "cta",
                "pod2_btn2": "cta",
                "pod2_content": "body",
                "pod2_content1": "body",
                "pod2_content2": "body",
                "pod2_else": "other",
                "pod2_else1": "other",
                "pod2_else2": "other",
                "pod2_head": "headline",
                "pod2_head1": "headline",
                "pod2_head2": "headline",
                "pod2_subhead": "sub_headline",
                "pod2_subhead1": "sub_headline",
                "pod2_subhead2": "sub_headline",
                "subhead": "sub_headline",
                "subhead1": "sub_headline",
                "subhead2": "sub_headline"
            },
            "source": "External Template App"
        },
        // externalTemplateId and externalTemplateSource are present only if experience has external templates
        "externalTemplateId": "two-pod-duplicate-fields",
        "externalTemplateSource": "External Template App"
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

