# GenStudio MLR Claims App - Reference App

A **reference application** for building Adobe GenStudio for Performance Marketing validation extensions with Medical, Legal, and Regulatory (MLR) claims checking capabilities.

> 📖 **[See QUICKSTART.md for setup instructions](./QUICKSTART.md)**

## What is This?

This example demonstrates a full-featured validation extension with:

- Real-time claims validation against regulatory requirements
- Multiple claims library support
- Integration with validation, prompt, and fragment swap extension points
- Experience selection and data display

Use this as a starting point for building compliance validation tools for medical, legal, or regulatory content approval.

## Extension Points

This app registers three extension points:

| Extension Point | Description | Access Location |
|-----------------|-------------|-----------------|
| **Prompt Drawer Dialog** | Add context (claims library selection) before content generation | Opens from the prompt input area |
| **Right Panel Dialog** | Validate generated content against MLR claims | Opens from the validation panel |
| **Fragment Swap Dialog** | Swap content fragments into experience fields | Opens when editing a field in an experience |

### Fragment Swap Dialog

The Fragment Swap Dialog allows users to replace content in an experience field with pre-approved MLR claims. This is useful when generated content needs to be swapped with compliant, pre-vetted text.

**Required Feature Flags:**

| Feature Flag | Purpose |
|--------------|---------|
| `GS-33054_horizon_canvas_content_fragment_swap` | Enables the swap button for experiences on Express or Horizon canvas |
| `GS-28940_Fragment_Swap_Extension` | Enables extensions to appear in the dropdown after opening the fragment swap dialog |

> ⚠️ Contact your Adobe administrator to enable these feature flags before using the Fragment Swap Dialog.

**How to Access:**
1. Generate an experience in GenStudio
2. Click on any editable field (headline, body, CTA, etc.)
3. Select the "Swap" or "Replace with claim" option
4. The Fragment Swap Dialog opens, showing:
   - **Left panel:** Available claims from your configured claim libraries
   - **Right panel:** Current experience context (fields, brand, product, channel)
5. Click a claim to select it — the field is highlighted showing which content will be swapped
6. Confirm to replace the field content with the selected claim

**Key SDK Services Used:**
```typescript
import { FragmentSwapExtensionService } from "@adobe/genstudio-extensibility-sdk";

// Get context about the experience and field being edited
FragmentSwapExtensionService.getExperience(guestConnection);
FragmentSwapExtensionService.getGenerationContext(guestConnection);
FragmentSwapExtensionService.getSelectedField(guestConnection);

// Set the replacement value
FragmentSwapExtensionService.setSwapValue(guestConnection, newValue);
```

**Customization:** Edit `src/genstudiopem/web-src/src/components/FragmentSwapDialog/index.tsx` to customize the UI, add filtering, or integrate with different content sources.

## Quick Start

```bash
npm install
aio app run     # Run locally at https://localhost:9080
aio app deploy  # Deploy to production
```

**First Step:** Edit `src/genstudiopem/web-src/src/Constants.ts` to configure your extension ID, claims libraries, and validation rules.

## What to Modify

- ✅ **`Constants.ts`** - Extension configuration and claims libraries
- ✅ **`components/`** - UI customization and validation logic
- ✅ **`utils/claimsValidation.ts`** - Claims checking algorithms
- ⚠️ **`app/`** - DO NOT modify (core registration logic)

## Claims Data Sources

This app supports multiple claims data sources:

### Local Claims Provider (Default)
Uses static claims data from `src/genstudiopem/actions/claims/provider/local/claims.js`. Perfect for development and testing.

### AEM Content Fragment Claims Provider (New!)
Fetches claims dynamically from AEM Content Fragments. Ideal for production content management workflows.


#### Edit .env with your AEM instance details and provider flag

    AEM_HOST=  # author-pxxxx-exxxx.adobeaemcloud.com
    CF_FOLDER_PATH= # e.g. /content/dam/us/en/claims
    CLAIM_PROVIDER_TYPE= # <aem | local> ## this is required filed with AEM_HOST configuration 

## Migration Note

This app has been updated to use:

- **React 18** with createRoot API
- **Spectrum S2** design system (@react-spectrum/s2)
- **TypeScript** with proper ESLint configuration

**Note:** Some complex components (RightPanel, ClaimsChecker, AdditionalContextDialog) may need manual updates to fully migrate Spectrum v3 components (View, Flex) to Spectrum S2. Replace these with standard div elements and CSS styling as needed.

## Documentation

- **[GenStudio Extensibility Guide](https://experienceleague.adobe.com/en/docs/genstudio-for-performance-marketing/ext-guide/home)** - Complete extensibility guide
- **[Validation Extensions](https://experienceleague.adobe.com/en/docs/genstudio-for-performance-marketing/ext-guide/apps/deploy-app)** - How validation extensions work

## License

Copyright 2025 Adobe. Licensed under Apache License 2.0.
