# GenStudio MLR Claims App - Reference App dummy

A **reference application** for building Adobe GenStudio for Performance Marketing validation extensions with Medical, Legal, and Regulatory (MLR) claims checking capabilities.

> 📖 **[See QUICKSTART.md for setup instructions](./QUICKSTART.md)**

## What is This?

This example demonstrates a full-featured validation extension with:

- Real-time claims validation against regulatory requirements
- Multiple claims library support
- Integration with both validation and prompt extension points
- Experience selection and data display

Use this as a starting point for building compliance validation tools for medical, legal, or regulatory content approval.

## Quick Start

```bash
npm install
aio app run      # Run locally at https://localhost:9080
aio app deploy   # Deploy to production
```

**First Step:** Edit `src/genstudiopem/web-src/src/Constants.ts` to configure your extension ID, claims libraries, and validation rules.

## What to Modify

- ✅ **`Constants.ts`** - Extension configuration and claims libraries
- ✅ **`components/`** - UI customization and validation logic
- ✅ **`utils/claimsValidation.ts`** - Claims checking algorithms
- ⚠️ **`app/`** - DO NOT modify (core registration logic)

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
