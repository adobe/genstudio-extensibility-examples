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

import { FragmentSwapExtensionService } from "@adobe/genstudio-extensibility-sdk";
import { Heading, ProgressCircle, Text } from "@react-spectrum/s2";
import { style } from "@react-spectrum/s2/style" with { type: "macro" };
import React, { useMemo, useState } from "react";
import { EXTENSION_ID } from "../../Constants";
import { useAuth, useClaimActions, useGuestConnection } from "../../hooks";

const listStyle = style({
  display: "flex",
  flexDirection: "column",
  gap: 8,
  marginTop: 12,
});

const itemStyle = style({
  padding: 12,
  borderRadius: "default",
  borderWidth: 2,
  borderStyle: "solid",
  cursor: "pointer",
  textAlign: "start",
});

export default function FragmentSwapDialog(): React.JSX.Element {
  const guestConnection = useGuestConnection(EXTENSION_ID);
  const auth = useAuth(guestConnection);
  const { claimLibraries, isLoadingClaims, error } = useClaimActions(auth);
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);

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
      FragmentSwapExtensionService.setSelectedValue(guestConnection, description);
    }
  };

  if (isLoadingClaims) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ProgressCircle aria-label="Loading claims" isIndeterminate />
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        padding: 16,
      }}
    >
      <Heading>Pick a claim to swap in</Heading>
      {error && <Text>{error}</Text>}
      <div className={listStyle}>
        {flatClaims.length === 0 && <Text>No claims available.</Text>}
        {flatClaims.map(({ libraryName, claim }) => {
          const isSelected = claim.id === selectedClaimId;
          return (
            <button
              key={claim.id}
              type="button"
              onClick={() => handleClaimSelect(claim.id, claim.description)}
              className={itemStyle}
              style={{
                borderColor: isSelected ? "#1473e6" : "#d0d0d0",
                backgroundColor: isSelected ? "#e8f0fe" : "white",
                fontWeight: isSelected ? 600 : 400,
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <Text>{libraryName}</Text>
                <Text>{claim.description}</Text>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
