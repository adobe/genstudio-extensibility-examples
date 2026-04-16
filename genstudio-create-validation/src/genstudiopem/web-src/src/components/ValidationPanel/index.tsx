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

import React, { useEffect, useState } from "react";
import { EXTENSION_ID } from "../../Constants";
import { Divider } from "@react-spectrum/s2";
import {
  Experience,
  ValidationExtensionService,
  GenerationContext,
} from "@adobe/genstudio-extensibility-sdk";
import { useGuestConnection } from "../../hooks";
import Spinner from "../Spinner";
import Header from "./Header";
import ExperienceSelector from "./ExperienceSelector";
import Content from "./Content";
import GenerationContextView from "./GenerationContextView";
import pRetry from "p-retry";

export default function ValidationPanel(): JSX.Element {
  const guestConnection = useGuestConnection(EXTENSION_ID);
  const [experiences, setExperiences] = useState<Experience[] | null>(null);
  const [selectedExperienceIndex, setSelectedExperienceIndex] = useState<
    number | null
  >(null);
  const [selectedExperience, setSelectedExperience] =
    useState<Experience | null>(null);
  const [generationContext, setGenerationContext] =
    useState<GenerationContext | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  /**
   * Polls for experiences from the host.
   * Need to do this because on first load, experiences are not yet available.
   * @returns void
   */
  useEffect(() => {
    const pollForExperiences = async () => {
      try {
        await pRetry(
          async () => {
            if (!(await syncExperiences()))
              throw new Error("No experiences yet");
          },
          {
            retries: 10,
            minTimeout: 2000,
            maxTimeout: 2000,
          },
        );
      } catch (e) {
        console.error("Failed to fetch experiences after retries:", e);
      }
    };
    setIsLoading(true);
    if (guestConnection) {
      pollForExperiences();
      fetchGenerationContext();
    }
    setIsLoading(false);
  }, [guestConnection]);

  /**
   * Syncs the list of experiences from the host.
   * Fetches the experiences from the host and sets the experiences state.
   * @returns void
   */
  const syncExperiences = async (): Promise<Experience[] | null> => {
    if (!guestConnection) return null;
    const remoteExperiences =
      await ValidationExtensionService.getExperiences(guestConnection);
    if (remoteExperiences && remoteExperiences.length > 0) {
      setExperiences(remoteExperiences);
      return remoteExperiences;
    }
    return null;
  };

  const fetchGenerationContext = async () => {
    if (!guestConnection) return;
    const context =
      await ValidationExtensionService.getGenerationContext(guestConnection);
    setGenerationContext(context);
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

  return (
    <div style={{ backgroundColor: "white", height: "100vh" }}>
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          <Header onSync={syncExperiences} />

          <ExperienceSelector
            experiences={experiences ?? []}
            selectedExperienceIndex={selectedExperienceIndex}
            onExperienceSelect={setSelectedExperienceIndex}
            onRunClaimsCheck={handleRunClaimsCheck}
          />

          <div style={{ paddingLeft: "1rem", paddingRight: "1rem" }}>
            <GenerationContextView generationContext={generationContext} />
          </div>

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
                <Content experience={selectedExperience} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
