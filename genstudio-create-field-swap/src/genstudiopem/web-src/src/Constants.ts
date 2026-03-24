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

export const EXTENSION_ID: string = "genstudio-example:create-field-swap-app";
export const EXTENSION_LABEL: string = "GenStudioExample - Create Field Swap App";
export const FIELD_SWAP_PANEL_ROUTE: string = "/field-swap-panel";

// Simple swap icon: two arrows indicating a swap
export const ICON_DATA_URI: string =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEgNEgxMk05IDFMMTIgNEw5IDciIHN0cm9rZT0iIzIwMjAyMCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8cGF0aCBkPSJNMTUgMTJIM002IDlMMywxMkw2IDE1IiBzdHJva2U9IiMyMDIwMjAiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+Cg==";

/**
 * App metadata object
 */
export const APP_METADATA: AppMetadata = {
  id: "<do not set this field, will be set by the extension registration>",
  label: EXTENSION_LABEL,
  iconDataUri: ICON_DATA_URI,
  supportedChannels: [
    {
      id: "email",
      name: "Email",
    },
    {
      id: "social",
      name: "Social",
    },
  ],
  extensionId: EXTENSION_ID,
  options: {},
};
