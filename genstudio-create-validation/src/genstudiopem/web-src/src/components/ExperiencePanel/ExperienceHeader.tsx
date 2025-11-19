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
import { Heading, Button, Divider } from "@react-spectrum/s2";

interface ExperienceHeaderProps {
  onSync: () => void;
}

/**
 * ExperienceHeader component that displays the header of the experiences panel.
 * @param onSync - Function triggered when the Sync button is pressed.
 * @returns The ExperienceHeader component
 */
export const ExperienceHeader: React.FC<ExperienceHeaderProps> = ({
  onSync,
}) => {
  return (
    <div
      style={{
        paddingLeft: "1rem",
        paddingRight: "1rem",
        paddingTop: "1rem",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "0.5rem",
        }}
      >
        <Heading>Experiences</Heading>
        <Button variant="secondary" onPress={onSync}>
          Sync
        </Button>
      </div>
      <Divider size="S" />
    </div>
  );
};
