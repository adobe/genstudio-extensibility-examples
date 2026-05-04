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
  VALIDATION_ROUTE,
  PROMPT_ROUTE,
  SELECT_CONTENT_ROUTE,
  IMPORT_TEMPLATE_ROUTE,
  FRAGMENT_SWAP_ROUTE,
  UPLOAD_AND_GET_URL_ACTION,
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
import { setSelectedExperienceId } from "../utils/experienceBridge";
import { actionWebInvoke } from "../utils/actionWebInvoke";
import actions from "../config.json";

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
          getToggles: async (id: string): Promise<Toggle[]> => {
            return [
              {
                metadata: getAppMetadata(id),
                onClick: async () => {
                  ValidationExtensionService.open(guestConnection, id);
                },
              }
            ];
          },
          getApps: async (id: string): Promise<App[]> => [
            {
              metadata: getAppMetadata(id),
              url: `#${VALIDATION_ROUTE}`,
            },
          ],
          handleSelectedExperienceChange: async (experienceId: string) => {
            setSelectedExperienceId(experienceId);
          },
        },

        promptExtension: {
          getToggles: async (id: string): Promise<Toggle[]> => {
            return [
              {
                metadata: getAppMetadata(id),
                onClick: async () => {
                  PromptExtensionService.open(guestConnection as any, id);
                },
              },
            ];
          },
          getApps: async (id: string): Promise<App[]> => [
            {
              metadata: getAppMetadata(id),
              url: `#${PROMPT_ROUTE}`,
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
          getApps: async (id: string): Promise<App[]> => [
            {
              url: `#${SELECT_CONTENT_ROUTE}`,
              metadata: getAppMetadata(id),
            },
          ],
          // DO NOT REMOVE THIS METHOD, IT IS USED BY GENSTUDIO
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
              actions[UPLOAD_AND_GET_URL_ACTION],
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
          getToggles: async (id: string): Promise<Toggle[]> => [
            {
              metadata: getAppMetadata(id),
              onClick: async () => {},
            },
          ],
          getApps: async (id: string): Promise<App[]> => [
            {
              url: `#${IMPORT_TEMPLATE_ROUTE}`,
              metadata: getAppMetadata(id),
            },
          ],
        },

        fragmentSwapExtension: {
          getToggles: async (id: string): Promise<Toggle[]> => [
            {
              metadata: getAppMetadata(id),
              onClick: async () => {},
            },
          ],
          getApps: async (id: string): Promise<App[]> => [
            {
              url: `#${FRAGMENT_SWAP_ROUTE}`,
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
