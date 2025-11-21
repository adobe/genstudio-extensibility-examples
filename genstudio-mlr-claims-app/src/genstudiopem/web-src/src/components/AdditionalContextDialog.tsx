/*
 * Copyright 2025 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0

 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {
  AdditionalContext,
  AdditionalContextTypes,
  Claim,
  PromptExtensionService,
} from "@adobe/genstudio-extensibility-sdk";
import { Button, ButtonGroup, Checkbox } from "@react-spectrum/s2";
import React, { useEffect, useState } from "react";
import { EXTENSION_ID } from "../Constants";
import { TEST_CLAIMS } from "../claims";
import { useGuestConnection, useSelectedClaimLibrary } from "../hooks";
import { ClaimsLibraryPicker } from "./ClaimsLibraryPicker";

export default function AdditionalContextDialog(): JSX.Element {
  const [filteredClaimsList, setFilteredClaimsList] = useState<Claim[]>([]);
  const [selectedClaims, setSelectedClaims] = useState<Claim[]>([]);

  const guestConnection = useGuestConnection(EXTENSION_ID);
  const { selectedClaimLibrary, handleClaimsLibrarySelection } =
    useSelectedClaimLibrary();

  useEffect(() => {
    const libraryClaims =
      TEST_CLAIMS.find((library) => library.id === selectedClaimLibrary)
        ?.claims || [];
    setFilteredClaimsList(libraryClaims);
  }, [selectedClaimLibrary]);

  const handleClaimChange = (claim: Claim) => {
    setSelectedClaims((prev) =>
      prev.some((c) => c.id === claim.id)
        ? prev.filter((c) => c.id !== claim.id)
        : [...prev, claim]
    );
  };

  const handleCancel = () => guestConnection.host.api.promptExtension.close();

  const handleClaimSelect = async () => {
    const claimsContext: AdditionalContext<Claim> = {
      extensionId: EXTENSION_ID,
      additionalContextType: AdditionalContextTypes.Claims,
      additionalContextValues: selectedClaims,
    };
    PromptExtensionService.updateAdditionalContext(
      guestConnection,
      claimsContext
    );
  };

  return (
    <div style={{ backgroundColor: "white", height: "100vh" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gridTemplateRows: "auto 1fr auto",
          gridTemplateAreas: '"library" "claims" "actions"',
          height: "100%",
          marginLeft: "1rem",
          marginRight: "1rem",
          gap: "1.5rem",
        }}
      >
        <div style={{ gridArea: "library", marginTop: "0.75rem" }}>
          <ClaimsLibraryPicker
            handleSelectionChange={handleClaimsLibrarySelection}
          />
        </div>
        <div style={{ gridArea: "claims", overflow: "auto" }}>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            {filteredClaimsList.map((claim) => (
              <Checkbox
                key={claim.id}
                isSelected={selectedClaims?.some((c) => c.id === claim.id)}
                onChange={() => handleClaimChange(claim)}
              >
                {claim.description}
              </Checkbox>
            ))}
          </div>
        </div>
        <div
          style={{
            gridArea: "actions",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <ButtonGroup>
            <Button variant="secondary" onPress={handleCancel}>
              Cancel
            </Button>
            <Button variant="primary" onPress={handleClaimSelect}>
              OK
            </Button>
          </ButtonGroup>
        </div>
      </div>
    </div>
  );
}
