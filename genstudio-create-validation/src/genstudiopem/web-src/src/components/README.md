# Components Folder

Custom UI components for the Create Validation App.

## Component Hierarchy

```
components/
├── Spinner.tsx                              # Reusable loading spinner
└── ValidationPanel/
    ├── index.tsx                            # 🏠 ROOT - Main validation panel
    ├── Header.tsx                           # Panel header
    ├── Content.tsx                          # Validation content display
    └── ExperienceSelector.tsx               # Experience selection dropdown
```

## Root Components

- **ValidationPanel** (`ValidationPanel/index.tsx`) - Main entry point for validation UI, orchestrates the validation flow and manages state
