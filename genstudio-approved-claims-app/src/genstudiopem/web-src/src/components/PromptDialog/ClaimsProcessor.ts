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

/**
 * @fileoverview Client-side claims processor for AEM Content Fragments.
 * This module handles validation and transformation of raw AEM fragments into claims format.
 */
import { CF_DISCRIPTION_FIELD } from "../../Constants";
export interface AEMFragment {
  id: string;
  title?: string;
  name?: string;
  fields?: FragmentField[];
}

export interface FragmentField {
  name: string;
  values: string[];
}

export interface ClaimItem {
  id: string;
  description: string;
  isError?: boolean;
}

export interface ClaimCategory {
  id: string;
  name: string;
  claims: ClaimItem[];
}

/**
 * Validates that a fragment has the required structure for claims extraction.
 */
export function isValidClaimFragment(fragment: AEMFragment): boolean {
  if (!fragment || !fragment.id) {
    return false;
  }

  const hasTitle = fragment.title || fragment.name;

  // Check if fields array exists and CF_DISCRIPTION_FIELD field exists
  if (!fragment.fields || !Array.isArray(fragment.fields)) {
    return false;
  }
  
  const claimsField = fragment.fields.find(field => field.name === CF_DISCRIPTION_FIELD);

  const isValid = !!(hasTitle && claimsField);
  return isValid;
}

/**
 * Filters fragments to only include those suitable for claims processing.
 */
export function filterValidClaimFragments(fragments: AEMFragment[]): AEMFragment[] {
  if (!Array.isArray(fragments)) {
    return [];
  }
  //Return no fragments 
  if (fragments.length === 0) {
    return [];
  }

  return fragments;
}

/**
 * Extracts claim information from a content fragment.
 */
export function extractClaimFromFragment(fragment: AEMFragment): { title: string; claims: ClaimItem[] } | null {
  try {
    // Extract fragment title/name to use as category
    const title = fragment.title || fragment.name || `Fragment-${fragment.id}`;
    // Find the CF_DISCRIPTION_FIELD field in the fields array
    const claimsField = fragment.fields.find(
      field => field.name === CF_DISCRIPTION_FIELD
    );
    const claimsInFragment = claimsField
      ? claimsField.values.map((claimText, index) => ({
        id: `${fragment.id}-claim-${index}`,
        description: claimText.replace(/<[^>]*>/g, ""),
      }))
      : [];
    if (claimsInFragment.length === 0) {
      return {
        title: title,
        claims: [{
          id: `${fragment.id}-no-claims`,
          description: "No claim present in this Fragment",
          isError: true
        }]
      };
    }

    return {
      title: title,
      claims: claimsInFragment
    };
  } catch (error) {
    // Return error indicator instead of null
    const title = fragment?.title || fragment?.name || `Fragment-${fragment?.id || 'unknown'}`;
    return {
      title: title,
      claims: [{
        id: `${fragment?.id || 'unknown'}-error`,
        description: "Error processing this CF",
        isError: true
      }]
    };
  }
}

/**
 * Generates a URL-safe category ID from the fragment title.
 */
export function generateCategoryId(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Transforms AEM content fragments into claims format.
 * Each content fragment becomes a category with its CF_DISCRIPTION_FIELD as claims.
 */
export function transformFragmentsToClaims(
  fragments: AEMFragment[],
  libraryId?: string
): ClaimCategory[] | { claims: ClaimItem[] } {
  const claimLibraries: ClaimCategory[] = [];

  fragments.forEach((fragment) => {
    try {
      const claimData = extractClaimFromFragment(fragment);

      if (!claimData) {
        return;
      }

      // Use fragment name/title as category
      const categoryId = generateCategoryId(claimData.title);

      // Each content fragment becomes its own category
      const claimCategory: ClaimCategory = {
        id: categoryId,
        name: claimData.title,
        claims: claimData.claims || []
      };
      claimLibraries.push(claimCategory);

    } catch (error) {
      console.error(`Error processing fragment ${fragment.id}:`, error);
    }
  });

  // If filtering by libraryId, return just the claims for that library
  if (libraryId) {
    const library = claimLibraries.find(lib => lib.id === libraryId);
    const result = library ? { claims: library.claims } : { claims: [] };
    return result;
  }
  return claimLibraries;
}

/**
 * Processes raw AEM fragments into claims with validation and error handling.
 */
export function processAEMFragments(
  rawFragments: AEMFragment[],
  libraryId?: string
): { claimLibraries: ClaimCategory[] | { claims: ClaimItem[] }, hasValidFragments: boolean, totalFragments: number } {


  if (!rawFragments || rawFragments.length === 0) {
    return {
      claimLibraries: libraryId ? { claims: [] } : [],
      hasValidFragments: false,
      totalFragments: 0
    };
  }

  // Filter to valid claim fragments
  const validFragments = filterValidClaimFragments(rawFragments);

  // Transform to claims format
  const claimLibraries = transformFragmentsToClaims(validFragments, libraryId);

  return {
    claimLibraries,
    hasValidFragments: validFragments.length > 0,
    totalFragments: rawFragments.length
  };
}