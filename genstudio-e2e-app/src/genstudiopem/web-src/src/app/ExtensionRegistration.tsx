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

// ==========================================================
// DO NOT MODIFY THIS FILE UNLESS YOU KNOW WHAT YOU ARE DOING
// ==========================================================

import { Text } from "@react-spectrum/s2";
import { register } from "@adobe/uix-guest";
import {
  EXTENSION_ID,
  APP_METADATA,
  VALIDATION_PANEL_ROUTE,
  PROMPT_DIALOG_ROUTE,
  ASSET_VIEWER_ROUTE,
  TEMPLATE_VIEWER_ROUTE,
  FRAGMENT_SWAP_ROUTE,
} from "../Constants";
import {
  App,
  AppMetadata,
  Asset,
  ExtensionAuth,
  PromptExtensionService,
  Toggle,
  ValidationExtensionService,
} from "@adobe/genstudio-extensibility-sdk";
import React, { Key } from "react";
import config from "../config.json";
import { actionWebInvoke } from "../utils/actionWebInvoke";
import {
  publishSelectedExperience,
  publishValidationPanelMode,
} from "../utils/validationBridge";

const UPLOAD_AND_GET_URL_ACTION = "genstudio-e2e-app/upload-and-get-url";
const UPLOAD_AND_GET_URL_ACTION_URL = (config as any)[UPLOAD_AND_GET_URL_ACTION] as string;

const getAppMetadata = (id: Key): AppMetadata => ({
  ...APP_METADATA,
  id: id.toString(),
});

const getCreateValidationMetadata = (id: Key): AppMetadata => ({
  ...APP_METADATA,
  id: `${id.toString()}-create-validation`,
  label: "E2E - Create Validation",
  options: {
    validation: {},
  },
});

const getSecondaryMetadata = (id: Key, labelSuffix: string): AppMetadata => ({
  ...APP_METADATA,
  id: `${id.toString()}-${labelSuffix.toLowerCase().replace(/\s+/g, "-")}`,
  label: `${APP_METADATA.label} - ${labelSuffix}`,
});

const getRuntimeTemplateConfig = (): {
  disableTemplateExtension: boolean;
  templateViewerUrlSuffix: string;
} => {
  const url = new URL(window.location.href);
  const hashQuery = url.hash.includes("?") ? url.hash.split("?")[1] : "";
  const hashParams = new URLSearchParams(hashQuery);

  const readParam = (name: string): string | null =>
    hashParams.get(name) ?? url.searchParams.get(name);

  const extValue = (readParam("ext") ?? "").toLowerCase();
  const disableTemplateExtension = extValue === "off" || extValue === "none" || extValue === "disabled";

  const fixture = readParam("fixture") ?? readParam("scenario");
  const params = new URLSearchParams();
  if (fixture) {
    params.set("fixture", fixture);
  }

  const suffix = params.toString();
  return {
    disableTemplateExtension,
    templateViewerUrlSuffix: suffix ? `?${suffix}` : "",
  };
};

const ExtensionRegistration = (): React.JSX.Element => {
  const init = async (): Promise<void> => {
    const templateConfig = getRuntimeTemplateConfig();
    const guestConnection = await register({
      id: EXTENSION_ID,
      methods: {
        validationExtension: {
          getToggles: async (id: string): Promise<Toggle[]> => [
            {
              metadata: getAppMetadata(id),
              onClick: async () => {
                // Must open with the registered extension ID (EXTENSION_ID).
                // host.guests is keyed by the manifest-registered ID only.
                // Using any other ID causes host.guests.get() to return
                // undefined → crash in GuestUIFrame.
                publishValidationPanelMode("mlr");
                ValidationExtensionService.open(guestConnection, id);
              },
            },
            {
              metadata: getCreateValidationMetadata(id),
              onClick: async () => {
                // Also opens with EXTENSION_ID (same as toggle 1) so the
                // guest connection resolves. The mode bridge switches the
                // panel content to create-validation view.
                publishValidationPanelMode("create-validation");
                ValidationExtensionService.open(guestConnection, id);
              },
            },
          ],
          getApps: async (id: string): Promise<App[]> => [
            {
              // Single app — both toggles load this URL.
              // Content is switched via the mode bridge.
              url: `#${VALIDATION_PANEL_ROUTE}`,
              metadata: getAppMetadata(id),
            },
          ],
          handleSelectedExperienceChange: async (experienceId: string) => {
            publishSelectedExperience(experienceId);
            console.log("[e2e] handleSelectedExperienceChange:", experienceId);
          },
        },

        promptExtension: {
          getToggles: async (id: string): Promise<Toggle[]> => [
            {
              metadata: getAppMetadata(id),
              onClick: async () => {
                PromptExtensionService.open(guestConnection as any, id);
              },
            },
            {
              metadata: getSecondaryMetadata(id, "Prompt B"),
              onClick: async () => {
                PromptExtensionService.open(guestConnection as any, id);
              },
            },
          ],
          getApps: async (id: string): Promise<App[]> => [
            {
              url: `#${PROMPT_DIALOG_ROUTE}`,
              metadata: getAppMetadata(id),
            },
            {
              url: `#${PROMPT_DIALOG_ROUTE}`,
              metadata: getSecondaryMetadata(id, "Prompt B"),
            },
          ],
        },

        selectContentExtension: {
          getToggles: async (id: string): Promise<Toggle[]> => [
            {
              metadata: getAppMetadata(id),
              onClick: async () => {},
            },
            {
              metadata: getSecondaryMetadata(id, "Assets B"),
              onClick: async () => {},
            },
          ],
          getApps: async (id: string): Promise<App[]> => [
            {
              url: `#${ASSET_VIEWER_ROUTE}`,
              metadata: getAppMetadata(id),
            },
            {
              url: `#${ASSET_VIEWER_ROUTE}`,
              metadata: getSecondaryMetadata(id, "Assets B"),
            },
          ],
          uploadAndGetUrl: async (
            auth: ExtensionAuth,
            asset: Asset
          ): Promise<{
            originalPath: string;
            originalUrl: string;
            thumbnailPath: string;
            thumbnailUrl: string;
          }> => {
            return await actionWebInvoke(
              UPLOAD_AND_GET_URL_ACTION_URL,
              auth.imsToken,
              auth.imsOrgId,
              {
                id: asset.id,
                name: asset.name,
                originalUrl: asset.externalAssetInfo.signedUrl,
                thumbnailUrl: asset.externalAssetInfo.signedThumbnailUrl,
              }
            );
          },
        },

        importTemplateExtension: {
          getToggles: async (id: string): Promise<Toggle[]> => {
            if (templateConfig.disableTemplateExtension) {
              return [];
            }

            return [
              {
                metadata: getAppMetadata(id),
                onClick: async () => {},
              },
            ];
          },
          getApps: async (id: string): Promise<App[]> => {
            if (templateConfig.disableTemplateExtension) {
              return [];
            }

            return [
              {
                url: `#${TEMPLATE_VIEWER_ROUTE}${templateConfig.templateViewerUrlSuffix}`,
                metadata: getAppMetadata(id),
              },
            ];
          },
        },

        fragmentSwapExtension: {
          getToggles: async (id: string): Promise<Toggle[]> => [
            {
              metadata: getAppMetadata(id),
              onClick: async () => {},
            },
            {
              metadata: getSecondaryMetadata(id, "Swap B"),
              onClick: async () => {},
            },
          ],
          getApps: async (id: string): Promise<App[]> => [
            {
              url: `#${FRAGMENT_SWAP_ROUTE}`,
              metadata: getAppMetadata(id),
            },
            {
              url: `#${FRAGMENT_SWAP_ROUTE}`,
              metadata: getSecondaryMetadata(id, "Swap B"),
            },
          ],
        },
      },
    });
  };

  init().catch(console.error);

  return (
    <Text>
      IFrame for integration with Host (GenStudio for Performance Marketing
      App)...
    </Text>
  );
};

export default ExtensionRegistration;
