# Components

Stub UI panels for each extension point. Each component renders at its registered route and uses `data-testid` attributes for Playwright targeting.

| Component | Route | Extension Point |
|---|---|---|
| `ValidationPanel` | `#/validation-panel` | `validationExtension` |
| `PromptDialog` | `#/prompt-dialog` | `promptExtension` |
| `AssetViewer` | `#/select-content-dialog` | `selectContentExtension` |
| `TemplateViewer` | `#/select-template-dialog` | `importTemplateExtension` |
| `FragmentSwapDialog` | `#/fragment-swap-dialog` | `fragmentSwapExtension` |
