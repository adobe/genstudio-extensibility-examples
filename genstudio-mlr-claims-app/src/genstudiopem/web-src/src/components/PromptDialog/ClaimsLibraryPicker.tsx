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

import { Picker, PickerItem } from "@react-spectrum/s2";
import React, { Key } from "react";
import { ClaimLibrary } from "../../types";

interface ClaimsLibraryPickerProps {
  // eslint-disable-next-line
  handleSelectionChange: (key: Key | null) => void;
  claimLibraries: ClaimLibrary[];
}

export const ClaimsLibraryPicker: React.FC<ClaimsLibraryPickerProps> = ({
  handleSelectionChange,
  claimLibraries,
}) => {
  return (
    <Picker
      placeholder="Select Claims Category..."
      onSelectionChange={handleSelectionChange}
    >
      {claimLibraries?.map((library: ClaimLibrary) => (
        <PickerItem key={library.id} id={library.id}>
          {library.name}
        </PickerItem>
      ))}
    </Picker>
  );
};
