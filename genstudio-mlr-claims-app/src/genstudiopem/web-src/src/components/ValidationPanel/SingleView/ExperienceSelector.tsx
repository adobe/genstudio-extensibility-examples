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
import { Picker, PickerItem } from "@react-spectrum/s2";
import { Experience } from "@adobe/genstudio-extensibility-sdk";

interface ExperienceSelectorProps {
  experiences: Experience[];
  onExperienceSelect: (index: number) => void;
}

/**
 * ExperienceSelector component that displays the selector of the experiences panel.
 * @param experiences - The experiences to display
 * @param onExperienceSelect - Function triggered when the experience is selected
 * @returns The ExperienceSelector component
 */
export default function ExperienceSelector({
  experiences,
  onExperienceSelect,
}: ExperienceSelectorProps) {
  const handleExperienceSelect = (key: React.Key | null) => {
    if (key === null) return;
    const index = experiences.findIndex((exp) => exp.id === key);
    if (index !== -1) {
      onExperienceSelect(index);
    }
  };
  return (
    <div style={{ marginBottom: 20, marginTop: 4 }}>
      <Picker
        label="Select Experience"
        onSelectionChange={handleExperienceSelect}
      >
        {experiences.map((experience, index) => (
          <PickerItem key={experience.id} id={experience.id}>
            {`Experience ${index + 1}`}
          </PickerItem>
        ))}
      </Picker>
    </div>
  );
}
