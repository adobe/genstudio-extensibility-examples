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

import { Text } from "@adobe/react-spectrum";
import { register } from "@adobe/uix-guest";
import { extensionId, ICON_DATA_URI, extensionLabel } from "../Constants";
import {
  App,
  AppMetadata,
  PromptExtensionService,
  ValidationExtensionService,
  Toggle,
} from "@adobe/genstudio-extensibility-sdk";
import React, { Key } from "react";
import { setSelectedExperienceId } from "../utils/experienceBridge";

interface DialogItem {
  id: string;
  url: string;
  extensionId: string;
}

const getAppMetadata = (id: Key): AppMetadata => ({
  id: id.toString(),
  label: extensionLabel,
  iconDataUri: ICON_DATA_URI,
  supportedChannels: [
    {
      id: "email",
      name: "Email",
    },
  ],
  extensionId: "deprecated",
  options: {
    validation: {
      singleExperienceViewMode: true,
      autoOpenApp: true,
    },
  },
});

const ExtensionRegistration = (): React.JSX.Element => {
  const init = async (): Promise<void> => {
    const guestConnection = await register({
      id: extensionId,
      methods: {
        validationExtension: {
          getToggles: async (id: string): Promise<Toggle[]> => {
            return [
              {
                metadata: getAppMetadata(id),
                onClick: async () => {
                  ValidationExtensionService.open(guestConnection as any, id);
                },
              },
            ];
          },
          getApps(id: string): App[] {
            return [
              {
                metadata: getAppMetadata(id),
                url: "#/right-panel",
              },
            ];
          },
          // (Optional) If handleSelectedExperienceChange is provided in ExtensionRegistration
          //            host app will render a experience selector at the top of the right panel
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
          getApps(id: string): App[] {
            return [
              {
                metadata: getAppMetadata(id),
                url: "#/additional-context-dialog",
              },
            ];
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
