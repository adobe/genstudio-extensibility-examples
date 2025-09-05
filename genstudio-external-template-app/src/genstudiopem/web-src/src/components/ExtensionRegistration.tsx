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

import { Text, Flex, View } from "@adobe/react-spectrum";
import { register } from "@adobe/uix-guest";
import { extensionId, ICON_DATA_URI, extensionLabel } from "../Constants";
import { AppMetadata, Toggle, App } from "@adobe/genstudio-extensibility-sdk";
import React, { Key } from "react";

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
  extensionId: "deprecated", // TODO: remove this once updated to SDK as optional
});

const ExtensionRegistration = (): React.JSX.Element => {
  const init = async (): Promise<void> => {
    const guestConnection = await register({
      id: extensionId,
      methods: {
        importTemplateExtension: {
          getToggles: async (id: string): Promise<Toggle[]> => [
            {
              metadata: getAppMetadata(id),
              onClick: async () => {},
            },
          ],
          getApps: (id: string): App[] => [
            {
              url: "#/select-template-dialog",
              metadata: getAppMetadata(id),
            },
          ],
        },
      },
    });
  };

  init().catch(console.error);

  return (
    <View padding="size-300">
      <Flex direction="column" gap="size-200">
        <Text>
          IFrame for integration with Host (GenStudio for Performance Marketing
          App)
        </Text>
      </Flex>
    </View>
  );
};

export default ExtensionRegistration;
