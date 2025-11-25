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
 * @typedef {Object} Claim - Claim object from @adobe/genstudio-extensibility-sdk
 */

/**
 * @class ClaimProvider
 * @description
 *   Base class for Claim providers.
 *   Uses the Template Method design pattern:
 *   - Public methods handle validation, then delegate to `do` methods.
 *   - Subclasses must override the `do` methods.
 */
class ClaimProvider {
  constructor(params, logger) {
    this.logger = logger;
  }

  /**
   * Template Method for getting claims.
   * 1. Validates params
   * 2. On validation error, throws `ValidationError`
   * 3. Otherwise calls subclass's `doGetClaims`
   *
   * @param {Object} params
   * @returns {Promise<{statusCode: number, body: {claims: Claim[]}}>}
   * @throws {ValidationError}
   */
  // eslint-disable-next-line no-unused-vars
  async getClaims(_params) {
    throw new Error("getClaims() not implemented");
  }
}

module.exports = ClaimProvider;
