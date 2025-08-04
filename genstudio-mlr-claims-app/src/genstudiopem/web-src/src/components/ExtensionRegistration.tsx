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
  Experience,
  ExtensionRegistrationService,
  Toggle,
} from "@adobe/genstudio-extensibility-sdk";
import React from "react";
import { setSelectedExperienceId } from "../utils/experienceBridge";

interface ToggleItem {
  appMetaData: AppMetadata;
  onClick: () => Promise<void>;
}

interface PanelItem {
  id: string;
  url: string;
  extensionId: string;
}

interface DialogItem {
  id: string;
  url: string;
  extensionId: string;
}

const getAppMetadata = (appExtensionId: string): AppMetadata => ({
  id: appExtensionId,
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
    }
  }
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
                  // @ts-ignore
                  // TODO: add to sdk
                  await guestConnection.host.api.validationExtension.open(id);
                },
              },
            ];
          },
          getApps(id: string): App[] {
            return [
              {
                url: "#/right-panel",
                metadata: getAppMetadata(id),
              },
            ];
          },
          // (Optional) If handleSelectedExperienceChange is provided in ExtensionRegistration
          //            host app will render a experience selector at the top of the right panel
          handleSelectedExperienceChange: async (experienceId: string) => {
            setSelectedExperienceId(experienceId);
          },
        },
        createContextAddOns: {
          addContextAddOn: async (
            appExtensionId: string
          ): Promise<ToggleItem[]> => {
            return [
              {
                appMetaData: getAppMetadata(appExtensionId),
                onClick: async () => {
                  await ExtensionRegistrationService.openAddContextAddOnBar(
                    guestConnection,
                    appExtensionId
                  );
                },
              },
            ];
          },
        },
        createCanvasDialog: {
          addDialog(appExtensionId: string): DialogItem[] {
            return [
              {
                id: `${appExtensionId}`,
                url: "#/additional-context-dialog",
                extensionId: appExtensionId,
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
