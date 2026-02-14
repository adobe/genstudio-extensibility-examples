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

import { Experience, ExperienceService } from "@adobe/genstudio-uix-sdk";
import {
  Button,
  Divider,
  Flex,
  Heading,
  Item,
  Picker,
  ProgressCircle,
  Text,
  View,
} from "@adobe/react-spectrum";
import React, { type Key, useEffect, useState } from "react";

import { extensionId } from "../Constants";
import {
  useFragmentPoller,
  useGuestConnectionContext,
  useSelectedFragment,
} from "../hooks";
import { ClaimResults } from "../types";
import { validateClaims } from "../utils/validateClaims";
import ClaimsChecker from "./ClaimsChecker";
import { FragmentPicker } from "./FragmentPicker";
import { AdditionalContextTypes, Claim, GenerationContext, PromptExtensionService } from "@adobe/genstudio-extensibility-sdk";

export default function RightPanel(): JSX.Element {
  const [experiences, setExperiences] = useState<Experience[] | null>(null);
  const [selectedExperienceIndex, setSelectedExperienceIndex] = useState<
    number | null
  >(null);
  const [claimsResults, setClaimsResults] = useState<ClaimResults | null>(null);

  const [isPollingExperiences, setIsPollingExperiences] = useState(false);
  const [isSyncingExperiences, setIsSyncingExperiences] = useState(false);
  const [isClaimsCheckLoading, setIsClaimsCheckLoading] = useState(false);
  const [generationContext, setGenerationContext] = useState<GenerationContext | null>(null);
  const [hasAutoRun, setHasAutoRun] = useState(false);
  const [allClaimsResults, setAllClaimsResults] = useState<{ [experienceIndex: number]: ClaimResults } | null>(null);
  const { guestConnection, auth, aemHost } =
    useGuestConnectionContext(extensionId);
  const { fragments, isPollingFragments, pollFragments } = useFragmentPoller(
    auth,
    aemHost
  );
  const { selectedFragmentKey, handleFragmentSelection } =
    useSelectedFragment();


  React.useEffect(() => {
    if (!guestConnection) return;
    const getGenerationContext = async () => {
      const context = await PromptExtensionService.getGenerationContext(guestConnection);
      setGenerationContext(context);
    };
    getGenerationContext();
  }, [guestConnection]);

  useEffect(() => {
    // Only run if we have generation context, fragments, and no fragment is currently selected
    if (!generationContext?.additionalContexts || !fragments || selectedFragmentKey) return;

    // Find existing claims context
    const existingClaimsContext = generationContext.additionalContexts.find(
      (ctx) => ctx.extensionId === extensionId &&
        ctx.additionalContextType === AdditionalContextTypes.Claims
    );

    if (existingClaimsContext?.additionalContextValues) {
      const existingClaims = existingClaimsContext.additionalContextValues as Claim[];

      if (existingClaims.length > 0) {
        const firstClaimId = existingClaims[0].id;
        const fragmentId = firstClaimId.split('-claim-')[0];

        // Check if this fragment exists in the available fragments
        const fragmentExists = fragments.some(f => f.id === fragmentId);

        if (fragmentExists) {
          handleFragmentSelection(fragmentId);
        }
      }
    }
  }, [generationContext, fragments, selectedFragmentKey, handleFragmentSelection]);


  // Reset auto-run flag when fragment changes (to allow auto-run with new fragment)
  useEffect(() => {
    setHasAutoRun(false);
    setClaimsResults(null); // Clear previous results when fragment changes
    setAllClaimsResults(null);
  }, [selectedFragmentKey]);

  // Enhanced version that stores results for all experiences
  useEffect(() => {
    const autoRunClaimsCheckForAllExperiences = async () => {
      if (
        !hasAutoRun &&
        selectedFragmentKey &&
        experiences &&
        experiences.length > 0 &&
        fragments &&
        fragments.length > 0 &&
        !isClaimsCheckLoading
      ) {
        setHasAutoRun(true);
        setIsClaimsCheckLoading(true);

        try {
          const allResults: { [experienceIndex: number]: ClaimResults } = {};

          // Run claims check for all experiences
          for (let i = 0; i < experiences.length; i++) {
            const result = validateClaims({
              experience: experiences[i],
              fragments,
              selectedFragmentKey,
            });

            allResults[i] = result;

            // Add small delay between checks to prevent overwhelming
            if (i < experiences.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 100));
            }
          }

          // Store all results and set first experience as selected
          setAllClaimsResults(allResults);

        } catch (error) {
          console.error("Error in auto-run claims check for all experiences:", error);
        } finally {
          setIsClaimsCheckLoading(false);
        }
      }
    };

    autoRunClaimsCheckForAllExperiences();
  }, [
    hasAutoRun,
    selectedFragmentKey,
    experiences,
    fragments,
    isClaimsCheckLoading
  ]);

  useEffect(() => {
    if (guestConnection) pollExperiences();
  }, [guestConnection]);

  useEffect(() => {
    if (auth && aemHost) pollFragments();
  }, [guestConnection, auth, aemHost]);


  const getExperience = async (): Promise<Experience[] | null> => {
    if (!guestConnection) return null;

    setIsSyncingExperiences(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const remoteExperiences = await ExperienceService.getExperiences(
        guestConnection
      );
      if (remoteExperiences && remoteExperiences.length > 0) {
        setExperiences(remoteExperiences);
        return remoteExperiences;
      }
      return null;
    } finally {
      setIsSyncingExperiences(false);
    }
  };

  const pollExperiences = async () => {
    setIsPollingExperiences(true);

    let retryCount = 0;
    const maxRetries = 10;
    const intervalMs = 2_000;

    while (retryCount < maxRetries) {
      const hasExperiences = await getExperience();
      if (hasExperiences) {
        setIsPollingExperiences(false);
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
      retryCount++;
    }

    setIsPollingExperiences(false);
  };

  const handleExperienceSelection = (key: Key | null) => {
    if (!key || !experiences?.length) return;
    const index = experiences.findIndex((exp) => exp.id === key);
    if (index !== -1) {
      setSelectedExperienceIndex(index);
      setClaimsResults(null);
      if (allClaimsResults && allClaimsResults[index]) {
        setClaimsResults(allClaimsResults[index]);
      } else {
        // Clear results if no cached data
        setClaimsResults(null);
      }
    }
  };

  const handleRunClaimsCheck = async () => {
    if (!selectedFragmentKey || selectedExperienceIndex === null) return;

    // setState is async so we need the result from getExperience directly
    const newExperiences = await getExperience();
    if (!newExperiences?.length) return;

    setIsClaimsCheckLoading(true);

    try {
      const result = validateClaims({
        experience: newExperiences[selectedExperienceIndex],
        fragments,
        selectedFragmentKey,
      });

      // Simulate loading with timeout
      const minLoadingTimeMs = 500;
      await new Promise((resolve) => setTimeout(resolve, minLoadingTimeMs));

      setClaimsResults(result);
    } catch (error) {
      console.error("Error in claims validation:", error);
    } finally {
      setIsClaimsCheckLoading(false);
    }
  };
  const renderSingleResult = () => {
    if (!claimsResults || selectedExperienceIndex === null) return null;

    return (
      <View>
        <Heading level={3} marginBottom="size-150">
          Experience {selectedExperienceIndex + 1}
        </Heading>
        <ClaimsChecker
          claims={claimsResults}
          experienceNumber={selectedExperienceIndex + 1}
        />
      </View>
    );
  };
  const renderExperiencePicker = () => {
    if (!experiences) return null;

    const selectedExperienceKey = selectedExperienceIndex !== null ? experiences[selectedExperienceIndex].id : null;

    return (
      <Picker
        label="Select experience"
        align="start"
        isDisabled={!selectedFragmentKey || isSyncingExperiences}
        selectedKey={selectedExperienceKey} // Add this line to show selected experience
        onSelectionChange={handleExperienceSelection}
      >
        {experiences.map((experience, index) => (
          <Item key={experience.id}>{`Experience ${index + 1}`}</Item>
        ))}
      </Picker>
    );
  };

  const renderRunClaimsCheckButton = () => {
    if (selectedExperienceIndex === null) return null;

    return (
      <Button
        variant="primary"
        isDisabled={isClaimsCheckLoading}
        onPress={handleRunClaimsCheck}
      >
        Run Claims Check
      </Button>
    );
  };

  const renderLoadingIndicator = () => (
    <Flex height="100%" alignItems="center" justifyContent="center">
      <ProgressCircle aria-label="Loading" isIndeterminate />
    </Flex>
  );

  const renderResults = () => {
    if (!allClaimsResults || !experiences || claimsResults) return null;

    return (
      <Flex direction="column" gap="size-300">
        {experiences.map((experience, index) => {
          const experienceResults = allClaimsResults[index];
          if (!experienceResults) return null;

          return (
            <View key={experience.id} marginBottom="size-200">
              <Heading level={3} marginBottom="size-150">
                Experience {index + 1}
              </Heading>
              <ClaimsChecker
                claims={experienceResults}
                experienceNumber={index + 1}
              />
              {index < experiences.length - 1 && <Divider size="S" marginY="size-200" />}
            </View>
          );
        })}
      </Flex>
    );
  };

  const renderClaimsChecker = () => (
    <Flex height="100%" direction="column" marginY="size-200" gap="size-400">
      <Flex direction="column" gap="size-200">
        <Heading level={2} marginY="size-0">
          Check Claims
        </Heading>
        <Flex direction="column" gap="size-300">
          <FragmentPicker
            handleSelectionChange={handleFragmentSelection}
            fragments={fragments}
            selectedFragmentKey={selectedFragmentKey}
          />
          {renderExperiencePicker()}
          {renderRunClaimsCheckButton()}
        </Flex>
      </Flex>
      {(isClaimsCheckLoading || allClaimsResults || claimsResults) && <Divider size="S" />}
      {isClaimsCheckLoading ? renderLoadingIndicator() : (claimsResults ? renderSingleResult() : renderResults())}
    </Flex>
  );

  const renderWaitingForExperiences = () => (
    <Flex
      height="100%"
      direction="column"
      alignItems="center"
      justifyContent="center"
      gap="size-200"
    >
      <ProgressCircle aria-label="Loading" isIndeterminate />
      {(isPollingExperiences || isPollingFragments) && (
        <Text>Waiting for experiences and AEM fragments to be ready...</Text>
      )}
    </Flex>
  );

  return (
    <View backgroundColor="static-white" height="100vh">
      <Flex height="100%" direction="column" marginX="size-200">
        {experiences &&
          experiences.length > 0 &&
          fragments &&
          fragments.length > 0
          ? renderClaimsChecker()
          : renderWaitingForExperiences()}
      </Flex>
    </View>
  );
}
