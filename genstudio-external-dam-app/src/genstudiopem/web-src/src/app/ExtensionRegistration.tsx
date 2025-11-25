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
import { EXTENSION_ID, APP_METADATA, ASSET_VIEWER_ROUTE } from "../Constants";
import {
  AppMetadata,
  Toggle,
  App,
  ExtensionAuth,
  Asset,
} from "@adobe/genstudio-extensibility-sdk";
import React, { Key } from "react";
import actions from "../config.json";
import { actionWebInvoke } from "../utils/actionWebInvoke";

const UPLOAD_AND_GET_URL_ACTION =
  "genstudio-external-dam-app/upload-and-get-url";

const getAppMetadata = (id: Key): AppMetadata => ({
  ...APP_METADATA,
  id: id.toString(),
});

const ExtensionRegistration = (): React.JSX.Element => {
  const init = async (): Promise<void> => {
    const guestConnection = await register({
      id: EXTENSION_ID,
      methods: {
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
