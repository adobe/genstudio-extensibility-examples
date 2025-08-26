## Changelog

### MLR app (guest) with GenStudio (host): what you do, and what to replace

- Register UI entries (toggles/apps) and open host UIs
  - File: `genstudio-mlr-claims-app/src/genstudiopem/web-src/src/components/ExtensionRegistration.tsx`
  - New (SDK):
```ts
ValidationExtensionService.open(guestConnection, id)
PromptExtensionService.open(guestConnection, id)
```
  - Old (direct host API, replace with SDK):
```ts
guestConnection.host.api.validationExtension.open(id)
guestConnection.host.api.promptExtension.open(id)
```

- Send additional context (e.g., selected claims) to host
  - File: `genstudio-mlr-claims-app/src/genstudiopem/web-src/src/components/AdditionalContextDialog.tsx`
  - New (SDK):
```ts
const payload: AdditionalContext<Claim> = {
  extensionId,
  additionalContextType: AdditionalContextTypes.Claims,
  additionalContextValues: selectedClaims,
}
PromptExtensionService.updateAdditionalContext(guestConnection, payload)
PromptExtensionService.close(guestConnection)
```
  - Old (direct host API, replace with SDK):
```ts
guestConnection.host.api.promptExtension.updateAdditionalContext(payload)
guestConnection.host.api.promptExtension.close()
```

- Read experiences from host and run validation
  - File: `genstudio-mlr-claims-app/src/genstudiopem/web-src/src/components/RightPanel.tsx`
  - New (SDK):
```ts
const experiences = await ValidationExtensionService.getExperiences(guestConnection)
```
  - Old (direct host API, replace with SDK):
```ts
const experiences = await guestConnection.host.api.validationExtension.getExperiences()
```

### Minimal flow pseudocode (guest ↔ host)
```ts
// 1) Guest registers with the host and exposes toggles/apps
const guestConnection = await register({ id: extensionId, methods: { /* ... */ } }) // host = GenStudio
// Open UIs when user clicks
ValidationExtensionService.open(guestConnection, id)
PromptExtensionService.open(guestConnection, id)

// 2) Additional context dialog → send selections
const payload: AdditionalContext<Item> = { extensionId, additionalContextType, additionalContextValues }
PromptExtensionService.updateAdditionalContext(guestConnection, payload)
PromptExtensionService.close(guestConnection)

// 3) Right panel → fetch data then run logic
const exps = await ValidationExtensionService.getExperiences(guestConnection)
if (exps?.length) runYourChecks(exps)
```

### Routes in the MLR app
- `#/additional-context-dialog` → shows `AdditionalContextDialog` (prompt flow)
- `#/right-panel` → shows `RightPanel` (validation flow)

### Migration checklist
- Replace any `guestConnection.host.api.promptExtension.*` with `PromptExtensionService.*`.
- Replace any `guestConnection.host.api.validationExtension.*` with `ValidationExtensionService.*`.
- Keep business logic (e.g., claims checks) app-local; use SDK only for host integration.

