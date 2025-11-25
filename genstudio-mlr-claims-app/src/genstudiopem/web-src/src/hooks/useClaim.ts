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

import { useState, useCallback, useEffect } from "react";
import { actionWebInvoke } from "../utils/actionWebInvoke";
import actions from "../config.json";
import { GET_CLAIMS_ACTION } from "../Constants";
import { Auth, ClaimLibrary } from "../types";

/**
 * Hook to fetch claims from the backend action
 * @param auth - The authentication object
 * @returns {Object} - The claim libraries object
 * - claimLibraries: ClaimLibrary[] - The claim libraries
 * - isLoadingClaims: boolean - Whether the claims are loading
 * - fetchClaims: function - The function to fetch the claims
 */
export const useClaimActions = (auth: Auth | null) => {
  const [claimLibraries, setClaimLibraries] = useState<ClaimLibrary[]>([]);
  const [isLoadingClaims, setIsLoadingClaims] = useState(false);

  useEffect(() => {
    if (auth) fetchClaims();
  }, [auth]);

  const fetchClaims = useCallback(async () => {
    if (!auth) return;
    setIsLoadingClaims(true);

    const response = await actionWebInvoke<{ claimLibraries: ClaimLibrary[] }>(
      actions[GET_CLAIMS_ACTION],
      auth.imsToken,
      auth.imsOrg
    );
    setClaimLibraries(response as unknown as ClaimLibrary[]);
    setIsLoadingClaims(false);
  }, [auth]);

  return {
    claimLibraries,
    isLoadingClaims,
  };
};
