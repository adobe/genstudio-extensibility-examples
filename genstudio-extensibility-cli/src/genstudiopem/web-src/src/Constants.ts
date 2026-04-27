/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { AppMetadata } from "@adobe/genstudio-extensibility-sdk";

export const EXTENSION_ID: string = "genstudio-example:e2e-test-app";
export const EXTENSION_LABEL: string = "GenStudioExample - E2E Test App [LOCAL]";
export const ICON_DATA_URI: string =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHJ4PSI0IiBmaWxsPSIjMTQ3M0U2Ii8+PHRleHQgeD0iMTIiIHk9IjE2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIxMiIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiPkUyRTwvdGV4dD48L3N2Zz4=";

// Routes
export const VALIDATION_PANEL_ROUTE: string = "/validation-panel";
export const PROMPT_DIALOG_ROUTE: string = "/prompt-dialog";
export const ASSET_VIEWER_ROUTE: string = "/select-content-dialog";
export const TEMPLATE_VIEWER_ROUTE: string = "/select-template-dialog";

export const SUPPORTED_CHANNELS = [
  { id: "email", name: "Email" },
  { id: "meta", name: "Meta" },
];

export const APP_METADATA: AppMetadata = {
  id: "<do not set this field, will be set by the extension registration>",
  label: EXTENSION_LABEL,
  iconDataUri: ICON_DATA_URI,
  supportedChannels: SUPPORTED_CHANNELS,
  extensionId: EXTENSION_ID,
  options: {
    validation: {
      singleExperienceViewMode: true,
      autoRefreshApp: true,
    },
  },
};
