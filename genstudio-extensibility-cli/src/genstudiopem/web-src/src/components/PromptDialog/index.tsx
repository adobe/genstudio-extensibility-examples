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

import React from "react";
import { Heading, Text } from "@react-spectrum/s2";
import { useGuestConnection, useAuth } from "../../hooks";
import { EXTENSION_ID } from "../../Constants";

export default function PromptDialog(): React.JSX.Element {
  const guestConnection = useGuestConnection(EXTENSION_ID);
  const auth = useAuth(guestConnection);

  return (
    <div data-testid="prompt-dialog" style={{ padding: "24px" }}>
      <Heading>Prompt Dialog</Heading>
      <Text>
        {auth
          ? "Connected to host. Ready to inject prompt data."
          : "Connecting to host..."}
      </Text>
    </div>
  );
}
