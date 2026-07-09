/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0

 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {
  Experience,
  FieldUpdate,
  FragmentSwapExtensionService,
  GenerationContext,
} from "@adobe/genstudio-extensibility-sdk";
import {
  Badge,
  Divider,
  Heading,
  ProgressCircle,
  Tag,
  TagGroup,
  Text,
} from "@react-spectrum/s2";
import { style } from "@react-spectrum/s2/style" with { type: "macro" };
import React, { useEffect, useMemo, useState } from "react";
import { EXTENSION_ID } from "../../Constants";
import { useAuth, useClaimActions, useGuestConnection } from "../../hooks";

const pageStyle = style({
  display: "flex",
  flexDirection: "row",
  gap: 16,
  padding: 16,
  height: "screen",
  boxSizing: "border-box",
  alignItems: "stretch",
});

const columnStyle = style({
  flexGrow: 1,
  flexBasis: 0,
  minWidth: 0,
  overflow: "auto",
  display: "flex",
  flexDirection: "column",
  gap: 12,
});

const headingStyle = style({
  font: "heading",
  marginTop: 0,
  marginBottom: 8,
});

const claimListStyle = style({
  display: "flex",
  flexDirection: "column",
  gap: 8,
});

const claimItemStyle = style({
  padding: 12,
  borderRadius: "default",
  borderWidth: 2,
  borderStyle: "solid",
  borderColor: "gray-300",
  backgroundColor: "white",
  cursor: "pointer",
  textAlign: "start",
});

const claimItemSelectedStyle = style({
  padding: 12,
  borderRadius: "default",
  borderWidth: 2,
  borderStyle: "solid",
  borderColor: "accent-1000",
  backgroundColor: "accent-200",
  cursor: "pointer",
  textAlign: "start",
  fontWeight: "bold",
});

const fieldListStyle = style({
  display: "flex",
  flexDirection: "column",
  gap: 8,
});

const fieldRowStyle = style({
  display: "flex",
  flexDirection: "column",
  gap: 2,
  padding: 8,
  borderRadius: "default",
  borderWidth: 1,
  borderStyle: "solid",
  borderColor: "gray-200",
  backgroundColor: "white",
});

const fieldRowTargetStyle = style({
  display: "flex",
  flexDirection: "column",
  gap: 2,
  padding: 8,
  borderRadius: "default",
  borderWidth: 2,
  borderStyle: "solid",
  borderColor: "accent-1000",
  backgroundColor: "accent-200",
});

const fieldRowHeaderStyle = style({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
});

const fullCenterStyle = style({
  height: "screen",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

export default function FragmentSwapDialog(): React.JSX.Element {
  const guestConnection = useGuestConnection(EXTENSION_ID);
  const auth = useAuth(guestConnection);
  const { claimLibraries, isLoadingClaims, error } = useClaimActions(auth);
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);

  const [experience, setExperience] = useState<Experience | null>(null);
  const [generationContext, setGenerationContext] =
    useState<GenerationContext | null>(null);
  const [selectedField, setSelectedField] = useState<FieldUpdate | null>(null);

  // Fetch experience, generation context, and the field-being-swapped from the
  // host once the guest connection is ready. Mirrors the inline-effect pattern
  // used in PromptDialog / ValidationPanel.
  useEffect(() => {
    if (!guestConnection) return;
    (async () => {
      try {
        const [exp, ctx, field] = await Promise.all([
          FragmentSwapExtensionService.getExperience(guestConnection),
          FragmentSwapExtensionService.getGenerationContext(guestConnection),
          FragmentSwapExtensionService.getSelectedField(guestConnection),
        ]);
        setExperience(exp);
        setGenerationContext(ctx);
        setSelectedField(field);
      } catch (e) {
        console.error("Failed to fetch swap context from host:", e);
      }
    })();
  }, [guestConnection]);

  const flatClaims = useMemo(() => {
    return (claimLibraries ?? []).flatMap((lib) =>
      lib.claims.map((claim) => ({
        libraryName: lib.name,
        claim,
      })),
    );
  }, [claimLibraries]);

  const handleClaimSelect = (claimId: string, description: string): void => {
    setSelectedClaimId(claimId);
    if (guestConnection) {
      FragmentSwapExtensionService.setSwapValue(guestConnection, description);
    }
  };

  if (isLoadingClaims) {
    return (
      <div className={fullCenterStyle}>
        <ProgressCircle aria-label="Loading claims" isIndeterminate />
      </div>
    );
  }

  const chips: string[] = [];
  if (generationContext?.brand?.name)
    chips.push(`Brand: ${generationContext.brand.name}`);
  if (generationContext?.product?.name)
    chips.push(`Product: ${generationContext.product.name}`);
  if (generationContext?.channel)
    chips.push(`Channel: ${generationContext.channel.name}`);
  if (generationContext?.locale)
    chips.push(`Locale: ${generationContext.locale}`);

  const fieldEntries = experience
    ? Object.values(experience.experienceFields ?? {})
    : [];

  const showContextPanel = !!(experience || generationContext);

  return (
    <div className={pageStyle}>
      {/* LEFT — content fragments (claims) */}
      <div className={columnStyle}>
        <Heading styles={headingStyle}>Pick a claim to swap in</Heading>
        {error && <Text>{error}</Text>}
        <div className={claimListStyle}>
          {flatClaims.length === 0 && <Text>No claims available.</Text>}
          {flatClaims.map(({ libraryName, claim }) => {
            const isSelected = claim.id === selectedClaimId;
            return (
              <button
                key={claim.id}
                type="button"
                onClick={() => handleClaimSelect(claim.id, claim.description)}
                className={isSelected ? claimItemSelectedStyle : claimItemStyle}
              >
                <Text>{libraryName}</Text>
                <br />
                <Text>{claim.description}</Text>
              </button>
            );
          })}
        </div>
      </div>

      {showContextPanel && (
        <>
          <Divider orientation="vertical" size="S" />

          {/* RIGHT — experience + generation context */}
          <div className={columnStyle}>
            <Heading styles={headingStyle}>Experience context</Heading>

            {generationContext?.userPrompt && (
              <div>
                <Text>
                  <strong>User prompt:</strong>
                </Text>
                <br />
                <Text>{generationContext.userPrompt}</Text>
              </div>
            )}

            {chips.length > 0 && (
              <TagGroup aria-label="Generation context tags">
                {chips.map((chip) => (
                  <Tag key={chip} id={chip}>
                    {chip}
                  </Tag>
                ))}
              </TagGroup>
            )}

            {fieldEntries.length > 0 && (
              <div className={fieldListStyle}>
                <Text>
                  <strong>Experience fields</strong>
                </Text>
                {fieldEntries.map((field) => {
                  const isTarget = selectedField?.name === field.fieldName;
                  return (
                    <div
                      key={field.fieldName}
                      className={isTarget ? fieldRowTargetStyle : fieldRowStyle}
                    >
                      <div className={fieldRowHeaderStyle}>
                        <Text>
                          <strong>{field.fieldName}</strong>
                        </Text>
                        {isTarget && (
                          <Badge variant="accent" size="S">
                            Swapping
                          </Badge>
                        )}
                      </div>
                      <Text>{field.fieldValue || "(empty)"}</Text>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
