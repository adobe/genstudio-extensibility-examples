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

const ClaimProvider = require("../ClaimProvider");
const { TEST_CLAIMS } = require("./claims");

/**
 * @class LocalClaimProvider
 * @description
 *   Local implementation of ClaimProvider that returns claims from a local data source.
 */
class LocalClaimProvider extends ClaimProvider {
  constructor(params, logger) {
    super(params, logger);
  }

  /**
   * Gets claims from local data source.
   * @param {Object} params
   * @param {string} [params.libraryId] - Optional library ID to filter claims
   * @returns {Promise<{statusCode: number, body: {claims: Array}}>}
   */
  async getClaims(params) {
    try {
      this.logger.info("Getting claims from local data source");

      // If libraryId is provided, filter by that library
      if (params.libraryId) {
        const library = TEST_CLAIMS.find((lib) => lib.id === params.libraryId);
        if (!library) {
          return {
            statusCode: 404,
            body: {
              error: `Library with id ${params.libraryId} not found`,
            },
          };
        }
        return {
          statusCode: 200,
          body: {
            claims: library.claims,
          },
        };
      }

      // Return all claims from all libraries
      return {
        statusCode: 200,
        body: TEST_CLAIMS,
      };
    } catch (error) {
      this.logger.error("Error getting claims:", error);
      throw error;
    }
  }
}

module.exports = LocalClaimProvider;
