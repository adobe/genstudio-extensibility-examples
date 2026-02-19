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

/**
 * @fileoverview Claims extraction and transformation utilities for AEM Content Fragments.
 * This module handles the business logic of converting AEM content fragments into claims format,
 * following the pattern from genstudio-aem-cf-claims-app.
 */

/**
 * Transforms AEM content fragments into claims format.
 * Each content fragment becomes a category with its textAssetMatchText as claims.
 * @param {Array} fragments - AEM content fragment items
 * @param {string} [libraryId] - Optional library ID to filter by
 * @param {Object} logger - Logger instance
 * @returns {Array} Claims in the expected format
 */
function transformFragmentsToClaims(fragments, libraryId, logger) {
  const claimLibraries = [];

  fragments.forEach((fragment, index) => {
    try {
      logger.debug(`Processing fragment ${index + 1}/${fragments.length}: ${fragment.id}`);
      
      // Extract claim data from fragment
      const claimData = extractClaimFromFragment(fragment, logger);
      
      if (!claimData) {
        logger.warn(`Skipping fragment ${fragment.id}: could not extract claim data`);
        return;
      }

      // Use fragment name/title as category
      const categoryId = generateCategoryId(claimData.title);

      // Each content fragment becomes its own category
      const claimCategory = {
        id: categoryId,
        name: claimData.title,
        claims: claimData.claims || []
      };
      claimLibraries.push(claimCategory);

    } catch (error) {
      logger.error(`Error processing fragment ${fragment.id}:`, error);
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
 * Extracts claim information from a content fragment.
 * Uses fragment name as category and textAssetMatchText field values as claims array.
 * @param {Object} fragment - AEM content fragment
 * @param {Object} logger - Logger instance
 * @returns {Object|null} Claim data or null if extraction fails
 */
function extractClaimFromFragment(fragment, logger) {
  try {
    // Extract fragment title/name to use as category
    const title = fragment.title || fragment.name || `Fragment-${fragment.id}`;
    
    // Find the textAssetMatchText field in the fields array
    const claimsField = fragment.fields?.find(
      (field) => field.name === "textAssetMatchText"
    );
    
    // Map values in claims field into objects with id and description
    const claimsInFragment = claimsField
      ? claimsField.values.map((claimText, index) => ({
          id: `${fragment.id}-claim-${index}`,
          description: claimText.replace(/<[^>]*>/g, ""), // Remove HTML tags
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
    logger.error(`Error extracting claim from fragment:`, error);
    
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
 * @param {string} title
 * @returns {string}
 */
function generateCategoryId(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Validates that a fragment has the required structure for claims extraction.
 * @param {Object} fragment - AEM content fragment
 * @param {Object} logger - Logger instance 
 * @returns {boolean} True if fragment is valid for claims processing
 */
function isValidClaimFragment(fragment, logger = console) {
  if (!fragment || !fragment.id) {
    return false;
  }

  const hasTitle = fragment.title || fragment.name;
  const hasFields = Array.isArray(fragment.fields);
  // Check if textAssetMatchText field exists
  const claimsField = hasFields ? fragment.fields.find(field => field.name === "textAssetMatchText") : null;
  const hasClaimsField = !!claimsField;
  
  // Accept fragments with title and fields structure (even if no claims yet)
  return !!(hasTitle && hasFields && hasClaimsField);
}

/**
 * Filters fragments to only include those suitable for claims processing.
 * @param {Array} fragments - Array of AEM content fragments
 * @param {Object} logger - Logger instance
 * @returns {Array} Filtered array of valid claim fragments
 */
function filterValidClaimFragments(fragments, logger) {
  
  if (!Array.isArray(fragments)) {
    return [];
  }

  if (fragments.length === 0) {
    logger.warn(`No fragments received from AEM`);
    return [];
  }

  const validFragments = fragments.filter((fragment, index) => {
    const isValid = isValidClaimFragment(fragment, logger);
    
    if (!isValid) {
      logger.debug(`Invalid fragment details:`, {
        id: fragment?.id,
        hasTitle: !!(fragment?.title || fragment?.name),
        hasFields: Array.isArray(fragment?.fields),
        fieldsCount: fragment?.fields ? fragment.fields.length : 0,
        availableKeys: Object.keys(fragment || {})
      });
    }
    return isValid;
  });
  
  if (validFragments.length === 0) {
    logger.warn(`No valid claim fragments found. Check your content fragment model and field mappings.`);
  }
  
  return validFragments;
}

module.exports = {
  transformFragmentsToClaims,
  extractClaimFromFragment,
  generateCategoryId,
  isValidClaimFragment,
  filterValidClaimFragments
};