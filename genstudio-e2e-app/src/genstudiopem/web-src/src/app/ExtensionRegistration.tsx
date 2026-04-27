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

const getAppMetadata = (id: Key): AppMetadata => ({
  ...APP_METADATA,
  id: id.toString(),
});

const ExtensionRegistration = (): React.JSX.Element => {
  const init = async (): Promise<void> => {
    const guestConnection = await register({
      id: EXTENSION_ID,
      methods: {
        validationExtension: {
          getToggles: async (id: string): Promise<Toggle[]> => [
            {
              metadata: getAppMetadata(id),
              onClick: async () => {
                ValidationExtensionService.open(guestConnection, id);
              },
            },
          ],
          getApps: (id: string): App[] => [
            {
              url: `#${VALIDATION_PANEL_ROUTE}`,
              metadata: getAppMetadata(id),
            },
          ],
          handleSelectedExperienceChange: async (experienceId: string) => {
            // Exposed for host to drive single-experience view mode
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
          ],
          getApps: (id: string): App[] => [
            {
              url: `#${PROMPT_DIALOG_ROUTE}`,
              metadata: getAppMetadata(id),
            },
          ],
        },

        selectContentExtension: {
          getToggles: async (id: string): Promise<Toggle[]> => [
            {
              metadata: getAppMetadata(id),
              onClick: async () => {},
            },
          ],
          getApps: (id: string): App[] => [
            {
              url: `#${ASSET_VIEWER_ROUTE}`,
              metadata: getAppMetadata(id),
            },
          ],
          uploadAndGetUrl: async (
            _auth: ExtensionAuth,
            asset: Asset
          ): Promise<{
            originalPath: string;
            originalUrl: string;
            thumbnailPath: string;
            thumbnailUrl: string;
          }> => {
            // Stub implementation for e2e testing — returns asset URLs as-is
            return {
              originalPath: asset.name,
              originalUrl: asset.externalAssetInfo.signedUrl,
              thumbnailPath: `thumb_${asset.name}`,
              thumbnailUrl: asset.externalAssetInfo.signedThumbnailUrl,
            };
          },
        },

        importTemplateExtension: {
          getToggles: async (id: string): Promise<Toggle[]> => [
            {
              metadata: getAppMetadata(id),
              onClick: async () => {},
            },
          ],
          getApps: (id: string): App[] => [
            {
              url: `#${TEMPLATE_VIEWER_ROUTE}`,
              metadata: getAppMetadata(id),
            },
          ],
        },

        selectDAMExtension: {
          getToggles: async (id: string): Promise<Toggle[]> => [
            {
              metadata: getAppMetadata(id),
              onClick: async () => {},
            },
          ],
          getApps: (id: string): App[] => [
            {
              url: `#${ASSET_VIEWER_ROUTE}`,
              metadata: getAppMetadata(id),
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
