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

import {
  ExtensionRegistrationService,
  GenerationContextService,
} from "@adobe/genstudio-uix-sdk";
import {
  AdditionalContext,
  AdditionalContextTypes,
  Claim,
  GenerationContext,
  PromptExtensionService,
} from "@adobe/genstudio-extensibility-sdk";

import {
  Button,
  ButtonGroup,
  Checkbox,
  Flex,
  Grid,
  ProgressCircle,
  Text,
  View,
} from "@adobe/react-spectrum";
import React, { useEffect, useState } from "react";

import { extensionId } from "../Constants";
import {
  useFragmentPoller, useGuestConnectionContext, useSelectedFragment,
} from "../hooks";
import { FragmentPicker } from "./FragmentPicker";
import { extractClaimsFromFragment } from "../utils/extractClaimsFromFragment";

export default function AdditionalContextDialog(): JSX.Element {
  const [filteredClaimsList, setFilteredClaimsList] = useState<Claim[]>([]);
  const [selectedClaims, setSelectedClaims] = useState<Claim[]>([]);
  const [generationContext, setGenerationContext] = useState<GenerationContext | null>(null);
  const { guestConnection, auth, aemHost } = useGuestConnectionContext(extensionId);
  const { fragments, isPollingFragments, pollFragments } = useFragmentPoller( auth, aemHost );
  const { selectedFragmentKey, handleFragmentSelection } = useSelectedFragment();

  useEffect(() => {
    if (auth && aemHost) pollFragments();
  }, [guestConnection, auth, aemHost]);

  useEffect(() => {
    if (!guestConnection) return;

    const getGenerationContext = async () => {
      try {
        const context = await PromptExtensionService.getGenerationContext(guestConnection);
        setGenerationContext(context);

        // Pre-populate selected claims from existing context
        if (context?.additionalContexts) {

          // Find claims context for this extension
          const existingClaimsContext = context.additionalContexts.find(
            (ctx) => ctx.extensionId === extensionId &&
              ctx.additionalContextType === AdditionalContextTypes.Claims
          );

          if (existingClaimsContext?.additionalContextValues) {
            const existingClaims = existingClaimsContext.additionalContextValues as Claim[];
            setSelectedClaims(existingClaims);

            // Auto-select the fragment that contains these claims
            if (existingClaims.length > 0 && fragments) {
              const firstClaimId = existingClaims[0].id;
              const fragmentId = firstClaimId.split('-claim-')[0];
              handleFragmentSelection(fragmentId);
            }
          }
        }

      } catch (error) {
        setGenerationContext(null);
      }
    };

    getGenerationContext();
  }, [guestConnection]);

  
  // New useEffect to handle fragment auto-selection when both context and fragments are available
  useEffect(() => {
    if (!generationContext?.additionalContexts || !fragments || selectedFragmentKey) return;

    // Find existing claims context
    const existingClaimsContext = generationContext.additionalContexts.find(
      (ctx) => ctx.extensionId === extensionId &&
        ctx.additionalContextType === AdditionalContextTypes.Claims
    );

    if (existingClaimsContext?.additionalContextValues) {
      const existingClaims = existingClaimsContext.additionalContextValues as Claim[];

      if (existingClaims.length > 0) {
        // Extract fragment ID from first claim ID (format: fragmentId-claim-index)
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

  useEffect(() => {
    if (!fragments || !selectedFragmentKey) return;
    const claims = extractClaimsFromFragment(fragments, selectedFragmentKey);
    setFilteredClaimsList(claims);

    // When fragment changes, preserve selected claims that are still available
    if (generationContext?.additionalContexts) {
      const existingClaimsContext = generationContext.additionalContexts.find(
        (ctx) => ctx.extensionId === extensionId &&
          ctx.additionalContextType === AdditionalContextTypes.Claims
      );

      if (existingClaimsContext?.additionalContextValues) {
        const existingClaims = existingClaimsContext.additionalContextValues as Claim[];
        // Only keep claims that still exist in the current fragment
        const validExistingClaims = existingClaims.filter(existingClaim =>
          claims.some(claim => claim.id === existingClaim.id)
        );

        if (validExistingClaims.length > 0) {
          setSelectedClaims(validExistingClaims);
        }
      }
    }

  }, [fragments, selectedFragmentKey]);


  const handleClaimChange = async (claim: Claim) => {
    setSelectedClaims((prev) =>
      prev.some((c) => c.id === claim.id)
        ? prev.filter((c) => c.id !== claim.id)
        : [...prev, claim]
    );
  };

  const handleCancel = () =>
    ExtensionRegistrationService.closeAddContextAddOnBar(guestConnection);

  const handleClaimSelect = async () => {

    const claimsContext: AdditionalContext<Claim> = {
      extensionId: extensionId,
      additionalContextType: AdditionalContextTypes.Claims,
      additionalContextValues: selectedClaims,
    };

    await PromptExtensionService.updateAdditionalContext(
      guestConnection,
      claimsContext
    );

    await GenerationContextService.setAdditionalContext(
      guestConnection,
      claimsContext
    );

    // Close the dialog after successful update
    ExtensionRegistrationService.closeAddContextAddOnBar(guestConnection);

  };

  const renderWaitingForFragments = () => {
    return (
      <Flex
        height="100%"
        direction="column"
        alignItems="center"
        justifyContent="center"
        gap="size-200"
        gridArea="claims"
      >
        <ProgressCircle aria-label="Loading" isIndeterminate />
        <Text>Waiting for fragments to be ready...</Text>
      </Flex>
    );
  };

  const renderClaims = () => {
    return (
      <>
        <View gridArea="fragments" marginTop="size-150">
          <FragmentPicker
            handleSelectionChange={handleFragmentSelection}
            fragments={fragments}
            selectedFragmentKey={selectedFragmentKey}
          />
        </View>
        <View gridArea="claims" overflow="auto">
          <Flex direction="column" gap="size-100">
            {filteredClaimsList.map((claim) => (
              <Checkbox
                key={claim.id}
                marginStart="size-50"
                isSelected={selectedClaims?.some((c) => c.id === claim.id)}
                onChange={() => handleClaimChange(claim)}
              >
                {claim.description}
              </Checkbox>
            ))}
          </Flex>
        </View>
      </>
    );
  };

  return (
    <View backgroundColor="static-white" height="100vh">
      <Grid
        columns={["1fr"]}
        rows={["auto", "1fr", "auto"]}
        areas={["fragments", "claims", "actions"]}
        height="100%"
        marginX="size-200"
        gap="size-300"
      >
        {isPollingFragments ? renderWaitingForFragments() : renderClaims()}
        <ButtonGroup gridArea="actions" align="end">
          <Button variant="secondary" onPress={handleCancel}>
            Cancel
          </Button>
          <Button variant="primary" style="fill" onPress={handleClaimSelect}>
            Select
          </Button>
        </ButtonGroup>
      </Grid>
    </View>
  );
}
