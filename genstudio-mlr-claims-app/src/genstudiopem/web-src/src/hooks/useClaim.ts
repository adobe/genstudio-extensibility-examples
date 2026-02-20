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
import { detectProviderType, processAEMResponse, processLocalResponse } from "../utils/responseProcessors";

/**
 * Hook to fetch claims from the backend action (supports both AEM and Local providers)
 * @param auth - The authentication object
 * @returns {Object} - The claim libraries object
 * - claimLibraries: ClaimLibrary[] - The claim libraries
 * - isLoadingClaims: boolean - Whether the claims are loading
 * - error: string | null - Error message if claims fetch failed
 * - fetchClaims: function - The function to fetch the claims
 */
export const useClaimActions = (auth: Auth | null) => {
  const [claimLibraries, setClaimLibraries] = useState<ClaimLibrary[]>([]);
  const [isLoadingClaims, setIsLoadingClaims] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);

  useEffect(() => {
    if (auth) fetchClaims();
  }, [auth]);

  const fetchClaims = useCallback(async () => {
    if (!auth) return;
    
    setIsLoadingClaims(true);
    setError(null); // Clear previous errors

    try {
      // Fetch data from backend (could be AEM fragments or local claims)
      const response = await actionWebInvoke<any>(
        actions[GET_CLAIMS_ACTION],
        auth.imsToken,
        auth.imsOrg
      );

      if (response && typeof response === "object") {
        // Detect provider type and process accordingly
        const providerType = detectProviderType(response);

        if (providerType === 'aem') {
          processAEMResponse(response, setError, setClaimLibraries);
        } else {
          processLocalResponse(response, setError, setClaimLibraries);
        }
      } else {
        setError("Invalid response from backend");
        setClaimLibraries([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch claims. Please check your connection and try again.";
      setError(errorMessage);
      setClaimLibraries([]); 
    } finally {
      setIsLoadingClaims(false);
      setHasAttemptedFetch(true); // Mark that we've attempted at least one fetch
    }
  }, [auth]);

  return {
    claimLibraries,
    isLoadingClaims,
    error,
    hasAttemptedFetch,
    fetchClaims,
  };
};
