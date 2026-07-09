# Components Folder

Custom UI components for the MLR Claims App.

## Component Hierarchy

```
components/
├── ValidationPanel/
│   ├── index.tsx                            # 🏠 ROOT - Validation Extension
│   ├── ResultsView.tsx                      # Results display coordinator
│   ├── SingleView/
│   │   ├── index.tsx                        # Single experience view
│   │   ├── ExperienceSelector.tsx           # Experience dropdown
│   │   ├── Pod.tsx                          # Content pod display
│   │   └── AlertMessage.tsx                 # Alert notifications
│   ├── OverallView/
│   │   ├── index.tsx                        # All experiences view root
│   │   └── ExperienceListItem.tsx           # Experience list item
│   └── ViolationField/
│       ├── index.tsx                        # Violation field root
│       ├── ViolationFieldHeader.tsx         # Field header with count
│       └── ViolationEntry.tsx               # Individual violation
└── PromptDialog/
    ├── index.tsx                            # 🏠 ROOT - Prompt Extension
    └── ClaimsLibraryPicker.tsx              # Claims library selector
```

## View Modes

- **Single View** - One experience at a time with detailed field violations
- **Overall View** - All experiences at once for quick comparison
