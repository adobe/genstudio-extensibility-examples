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
import {
  Experience,
  ValidationExtensionService,
} from "@adobe/genstudio-extensibility-sdk";
import { ProgressCircle, Text, Divider, Button } from "@react-spectrum/s2";
import pRetry from "p-retry";
import { APP_METADATA, EXTENSION_ID } from "../../Constants";
import { useAuth, useClaimActions, useGuestConnection } from "../../hooks";
import { ClaimResults } from "../../types";
import { validateClaims } from "../../utils/claimsValidation";
import {
  getSelectedExperienceId,
  SELECTED_EXPERIENCE_ID_STORAGE_KEY,
  setSelectedExperienceId,
} from "../../utils/experienceBridge";
import ResultsView from "./ResultsView";
import { style } from "@react-spectrum/s2/style" with {type: 'macro'};

export default function ValidationPanel(): JSX.Element {
  const [experiences, setExperiences] = useState<Experience[] | null>(null);
  const [selectedExperienceIndex, setSelectedExperienceIndex] = useState<
    number | null
  >(null);
  const [claimsResults, setClaimsResults] = useState<ClaimResults[] | null>(
    null
  );
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const guestConnection = useGuestConnection(EXTENSION_ID);
  const [viewMode, setViewMode] = useState<string>(APP_METADATA.options?.validation?.singleExperienceViewMode ? "single" : "all");

  const auth = useAuth(guestConnection);
  const { claimLibraries } = useClaimActions(auth);

  // ==========================================================
  //                    EFFECTS & HOOKS
  // ==========================================================
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
          }
        );
      } catch (e) {
        console.error("Failed to fetch experiences after retries:", e);
      }
    };
    if (guestConnection) pollForExperiences();
  }, [guestConnection]);

  /**
   * If the selected experience index is changed, re-run the claims check with the new experience.
   */
  useEffect(() => {
    if (selectedExperienceIndex !== null) handleRunClaimsCheck();
  }, [selectedExperienceIndex]);

  /**
   * If the selected experience id is changed, set the selected experience index.
   */
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === SELECTED_EXPERIENCE_ID_STORAGE_KEY && event.newValue)
        setSelectedExperienceIndex(getExperienceIndex(event.newValue));
    };
    const selectedExperienceId = getSelectedExperienceId();
    if (selectedExperienceId && experiences?.length)
      setSelectedExperienceIndex(getExperienceIndex(selectedExperienceId));

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [experiences]);

  // ==========================================================
  //                    HANDLERS & FUNCTIONS
  // ==========================================================

  /**
   * Handles the run claims check action.
   * Sets the selected experience based on the selected experience index.
   * @returns void
   */
  const handleRunClaimsCheck = async () => {
    if (selectedExperienceIndex === null) return;
    // setState is async so we need the result from getExperience directly
    const newExperiences = await syncExperiences();
    if (!newExperiences?.length) return;
    setIsValidating(true);
    try {
      // run all claim libraries
      const results: ClaimResults[] = [];
      for (let experience of newExperiences) {
        const result = validateClaims(experience, claimLibraries);
        results.push(result);
      }
      setClaimsResults(results);
    } catch (error) {
      console.error("Error while running claims check:", error);
    } finally {
      setIsValidating(false);
    }
  };

  /**
   * Gets the index of the experience with the given id. Default to 0 if not found.
   * @param experienceId - The id of the experience
   * @returns The index of the experience
   */
  const getExperienceIndex = (experienceId: string): number => {
    if (!experiences?.length) return 0;
    const index = experiences.findIndex((exp) => exp.id === experienceId);
    return index !== -1 ? index : 0;
  };

  /**
   * Syncs the list of experiences from the host.
   * Fetches the experiences from the host and sets the experiences state.
   * @returns void
   */
  const syncExperiences = async (): Promise<Experience[] | null> => {
    if (!guestConnection) return null;
    const remoteExperiences = await ValidationExtensionService.getExperiences(
      guestConnection
    );
    if (remoteExperiences && remoteExperiences.length > 0) {
      setExperiences(remoteExperiences);
      return remoteExperiences;
    }
    return null;
  };

  /**
   * Handles the experience select action.
   * Sets the selected experience index and the selected experience id.
   * Need to set both local state as well as sessionStorage
   * @param index - The index of the selected experience
   * @returns void
   */
  const handleExperienceSelect = (index: number) => {
    setSelectedExperienceIndex(index);
    setSelectedExperienceId(experiences![index].id);
  };

  // ==========================================================
  //                        RENDER
  // ==========================================================
  const hasExperiences = experiences?.length ?? 0;
  const containerStyle: React.CSSProperties = {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    marginRight: "1rem",
    marginLeft: "1rem",
  };
  const centerContentStyle: React.CSSProperties = {
    backgroundColor: "white",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    gap: "1rem",
  };
  const headingStyle = style({ font: "heading", marginTop: 20, marginBottom: 12 });

  const manualClaimsCheck = () => {
    return (<>
      <p className={headingStyle}> Check Claims </p>
      {selectedExperienceIndex !== null && (
        <Button
          variant="primary"
          fillStyle="outline"
          isDisabled={isValidating}
          onPress={handleRunClaimsCheck}
          UNSAFE_style={{ width: "100%" }}
        >
          Run Claims Check
        </Button>
      )}
      {(isValidating || claimsResults) && (
        <Divider size="S" UNSAFE_style={{ marginTop: 30, marginBottom: 30 }} />
      )}
    </>)
  };

  return (
    <div style={containerStyle}>
      {hasExperiences ? (
        <>
          {APP_METADATA.options?.validation?.autoRefreshApp ? null : manualClaimsCheck()}
          {isValidating ? (
            <div
              style={{
                display: "flex",
                height: "100%",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ProgressCircle aria-label="Loading" isIndeterminate />
            </div>
          ) : (
            claimsResults && (
              <ResultsView
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                claimsResults={claimsResults}
                onExperienceSelect={handleExperienceSelect}
                selectedExperienceIndex={selectedExperienceIndex}
                experiences={experiences!}
              />
            )
          )}
        </>
      ) : (
        <div style={centerContentStyle}>
          <ProgressCircle aria-label="Loading" isIndeterminate />
          <Text>Waiting for experiences to be ready...</Text>
        </div>
      )}
    </div>
  );
}
