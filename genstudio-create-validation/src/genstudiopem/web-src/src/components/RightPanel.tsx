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

import React, { useState } from "react";
import { EXTENSION_ID } from "../Constants";
import { Button } from "@react-spectrum/s2";
import {
  Experience,
  ValidationExtensionService,
} from "@adobe/genstudio-extensibility-sdk";
import { useGuestConnection } from "../hooks";
import Spinner from "./Spinner";
import { ExperiencePanel } from "./ExperiencePanel";

export default function RightPanel(): JSX.Element {
  const guestConnection = useGuestConnection(EXTENSION_ID);
  const [experiences, setExperiences] = useState<Experience[] | null>(null);
  const [selectedExperienceIndex, setSelectedExperienceIndex] = useState<
    number | null
  >(null);
  const [selectedExperience, setSelectedExperience] =
    useState<Experience | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  /**
   * Syncs the list of experiences from the host.
   * Fetches the experiences from the host and sets the experiences state.
   * @returns void
   */
  const syncExperience = async (): Promise<void> => {
    if (!guestConnection) return;
    setIsLoading(true);

    try {
      setExperiences(
        await ValidationExtensionService.getExperiences(guestConnection)
      );
    } catch (error) {
      console.error("Error fetching experiences:", error);
    }
    setIsLoading(false);
  };

  /**
   * Handles the run claims check action.
   * Sets the selected experience based on the selected experience index.
   * @returns void
   */
  const handleRunClaimsCheck = (): void => {
    if (experiences && selectedExperienceIndex !== null)
      setSelectedExperience(experiences[selectedExperienceIndex]);
  };

  if (isLoading) return <Spinner message="Loading experiences..." />;

  const hasExperiences = experiences && experiences.length > 0;
  return (
    <div style={{ backgroundColor: "white", height: "100vh" }}>
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        {hasExperiences ? ( // Show the experience panel if there are experiences
          <ExperiencePanel
            experiences={experiences}
            selectedExperienceIndex={selectedExperienceIndex}
            selectedExperience={selectedExperience}
            onSync={syncExperience}
            onExperienceSelect={setSelectedExperienceIndex}
            onRunClaimsCheck={handleRunClaimsCheck}
          />
        ) : (
          // Show the button to get experiences if there are no experiences
          <div style={{ padding: "1rem" }}>
            <Button variant="primary" onPress={syncExperience}>
              Get Experiences
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
