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

import { Picker, PickerItem, Text, ProgressCircle } from "@react-spectrum/s2";
import React, { Key } from "react";
import { ClaimLibrary } from "../../types";

interface ClaimsLibraryPickerProps {
  // eslint-disable-next-line
  handleSelectionChange: (key: Key | null) => void;
  claimLibraries: any;
  selectedKey?: string;
  isLoading?: boolean;
  error?: string | null;
  hasAttemptedFetch?: boolean;
}
const renderWaitingForFragments = () => {
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "12px",
          gridArea: "claims"
        }}
      >
        <ProgressCircle aria-label="Loading" isIndeterminate />
        <Text>Waiting for fragments to be ready...</Text>
      </div>
    );
  };

  const renderNoFragments = () => {
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "12px",
          gridArea: "claims"
        }}
      >
        <Text>No AEM fragment present or something went wrong.</Text>
      </div>
    );
  };
export const ClaimsLibraryPicker: React.FC<ClaimsLibraryPickerProps> = ({
  handleSelectionChange,
  claimLibraries,
  selectedKey,
  isLoading = false,
  error = null,
  hasAttemptedFetch = false,
}) => {
  
  // Show loading state when fetching claims
  if (isLoading) {
    return renderWaitingForFragments();
  }

  // Show error message if there's an error
  if (error && hasAttemptedFetch) {
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "12px",
          gridArea: "claims"
        }}
      >
        <Text>{error}</Text>
      </div>
    );
  }

  // Show no fragments message when no claims available
  if (hasAttemptedFetch && (!claimLibraries || claimLibraries.length === 0)) {
    return renderNoFragments();
  }

  // Don't render anything if we haven't tried fetching yet
  if (!hasAttemptedFetch) {
    return null;
  }

  // Show the picker when we have claim libraries
  return (
    <Picker
      placeholder="Select Claims Category..."
      selectedKey={selectedKey ?? null}
      onSelectionChange={handleSelectionChange}
    >
      {claimLibraries?.map((library: ClaimLibrary, index: number) => (
        <PickerItem key={library.id || `library-${index}`} id={library.id}>
          {library.name}
        </PickerItem>
      ))}
    </Picker>
  );
};
