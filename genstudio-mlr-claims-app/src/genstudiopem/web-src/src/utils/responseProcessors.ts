/*
Copyright 2026 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { ClaimLibrary } from "../../types";
import { processAEMFragments, AEMFragment } from "../components/PromptDialog/ClaimsProcessor";

/**
 * Processes AEM provider response containing fragments
 */
export function processAEMResponse(
  response: { fragments: AEMFragment[] },
  setError: (error: string | null) => void,
  setClaimLibraries: (libraries: ClaimLibrary[]) => void
): void {
  
  const processResult = processAEMFragments(response.fragments);
  
  if (processResult.totalFragments === 0) {
    setError("No matching fragment available");
    setClaimLibraries([]);
  } else if (!processResult.hasValidFragments) {
    setError("No valid claim fragments found. Please check your content fragment structure.");
    setClaimLibraries([]);
  } else {
    setClaimLibraries(Array.isArray(processResult.claimLibraries) 
      ? processResult.claimLibraries 
      : [processResult.claimLibraries as any]);
    setError(null); 
  }
}

/**
 * Processes Local provider response containing claims
 */
export function processLocalResponse(
  response: ClaimLibrary[] | { claims: any[] } | any,
  setError: (error: string | null) => void,
  setClaimLibraries: (libraries: ClaimLibrary[]) => void
): void {
  // Handle different local response formats
  if (Array.isArray(response)) {
    setClaimLibraries(response);
    setError(null);
  } else if (response && typeof response === "object" && response.claims) {
    setClaimLibraries(Array.isArray(response.claims) ? [response as ClaimLibrary] : response.claims);
    setError(null);
  } else if (response && typeof response === "object" && Object.keys(response).length > 0) {
    setClaimLibraries([response as ClaimLibrary]);
    setError(null);
  } else {
    setError("No claims available from local provider");
    setClaimLibraries([]);
  }
}

/**
 * Determines the provider type based on response structure
 */
export function detectProviderType(response: any): 'aem' | 'local' {
  // AEM provider returns response with 'fragments' property
  if (response && typeof response === "object" && response.fragments) {
    return 'aem';
  }
  // Local provider returns array or object with 'claims' property
  return 'local';
}