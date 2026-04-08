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

import { Claim } from "@adobe/genstudio-uix-sdk";
import { Key } from "react";

export const extractClaimsFromFragment = (
  fragments: any[], // TODO: type
  selectedFragmentKey: Key | undefined
): Claim[] => {
  const selectedFragment = fragments.find(
    (fragment) => fragment.id === selectedFragmentKey
  );
  // find claims field in selected fragment
  const claimsField = selectedFragment?.fields.find(
    (field: any) => field.name === "textAssetMatchText" // TODO: type, update the CF field name here 
  );

  // map values in claims field into an obj with id and description
  const claimsInSelectedFragment: Claim[] = claimsField
    ? claimsField.values.map((claimText: string, index: number) => ({
        id: `${selectedFragment.id}-claim-${index}`,
        description: claimText.replace(/<[^>]*>/g, ""),
      }))
    : [];

  return claimsInSelectedFragment;
};
