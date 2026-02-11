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

import { Experience } from "@adobe/genstudio-uix-sdk";
import { ClaimResults } from "../types";
import { validateClaimsWithStringMatching, hasViolations } ;
import { validateClaimsWithOpenAI } from "./openAiValidation";

/**
 * Two-stage validation approach:
 * 1. First run string matching validation
 * 2. Only if no violations found, run OpenAI validation
 */
export async function validateClaimsTwoStage(
  experience: Experience,
  claims: { id: string; description: string }[]
): Promise<ClaimResults> {
  console.log('Starting two-stage validation...');
  
  // Stage 1: String matching validation
  console.log('Stage 1: Running string matching validation...');
  const stringMatchResults = validateClaimsWithStringMatching(experience, claims);
  
  // Check if there are any violations from string matching
  const hasStringViolations = hasViolations(stringMatchResults);
  
  console.log('String matching results:', {
    hasViolations: hasStringViolations,
    results: stringMatchResults
  });
  
  if (hasStringViolations) {
    console.log('Violations found in string matching - skipping OpenAI validation');
    return stringMatchResults;
  }
  
  // Stage 2: OpenAI validation (only if no string violations)
  console.log('Stage 2: No string violations found - running OpenAI validation...');
  try {
    const openAiResults = await validateClaimsWithOpenAI(experience, claims);
    console.log('OpenAI validation completed:', openAiResults);
    return openAiResults;
  } catch (error) {
    console.error('OpenAI validation failed, falling back to string results:', error);
    return stringMatchResults;
  }
} 