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
import { Divider } from "@react-spectrum/s2";
import { Experience } from "@adobe/genstudio-extensibility-sdk";
import { ExperienceDetails } from "./ExperienceDetails";
import { ExperienceSelector } from "./ExperienceSelector";
import { ExperienceHeader } from "./ExperienceHeader";

interface ExperiencePanelProps {
  experiences: Experience[];
  selectedExperienceIndex: number | null;
  selectedExperience: Experience | null;
  onSync: () => void;
  onExperienceSelect: (index: number) => void;
  onRunClaimsCheck: () => void;
}

export const ExperiencePanel: React.FC<ExperiencePanelProps> = ({
  experiences,
  selectedExperienceIndex,
  selectedExperience,
  onSync,
  onExperienceSelect,
  onRunClaimsCheck,
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
      }}
    >
      <ExperienceHeader onSync={onSync} />

      <ExperienceSelector
        experiences={experiences}
        selectedExperienceIndex={selectedExperienceIndex}
        onExperienceSelect={onExperienceSelect}
        onRunClaimsCheck={onRunClaimsCheck}
      />

      {selectedExperience && (
        <div
          style={{
            paddingLeft: "1rem",
            paddingRight: "1rem",
            paddingTop: "1rem",
            flex: 1,
          }}
        >
          <Divider size="S" />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
            }}
          >
            <ExperienceDetails experience={selectedExperience} />
          </div>
        </div>
      )}
    </div>
  );
};
