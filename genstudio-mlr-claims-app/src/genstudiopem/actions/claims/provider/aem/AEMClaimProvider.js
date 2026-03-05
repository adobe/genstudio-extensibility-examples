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

const ClaimProvider = require("../ClaimProvider");
const { ValidationError, getBearerToken } = require("../../../utils");
const fetch = require("node-fetch");

/**
 * @class AEMClaimProvider
 * @description
 *   AEM Content Fragment implementation of ClaimProvider that fetches raw content fragments from AEM.
 *   Claims extraction and transformation logic is handled client-side in React components.
 */
class AEMClaimProvider extends ClaimProvider {
  constructor(params, logger) {
    super(params, logger);
    this.aemHost = params.aemHost;
    this.cfFolderPath = params.cfFolderPath || "";
  }

  /**
   * Gets raw content fragments from AEM.
   * @param {Object} params
   * @param {string} params.aemHost - AEM host URL
   * @param {string} [params.cfFolderPath] - Content fragment folder path
   * @returns {Promise<{statusCode: number, body: {fragments: Array}}>}
   */
  async getClaims(params) {
    try {
      this.validateParams(params);

      // Fetch content fragments from AEM
      const fragments = await this.fetchContentFragments(params);
      
      return {
        statusCode: 200,
        body: { fragments: fragments || [] },
      };
    } catch (error) {
      this.logger.error("Error fetching fragments from AEM:", error);
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new Error(`Failed to fetch fragments from AEM: ${error.message}`);
    }
  }

  /**
   * Validates required parameters for AEM operations.
   * @param {Object} params
   * @throws {ValidationError}
   */
  validateParams(params) {
    if (!params.aemHost) {
      throw new ValidationError("aemHost parameter is required");
    }

    if (!params.__ow_headers?.authorization) {
      throw new ValidationError("Authorization header is required");
    }
  }

  /**
   * Fetches content fragments from AEM.
   * @param {Object} params
   * @returns {Promise<Array>}
   */
  async fetchContentFragments(params) {
    const imsToken = getBearerToken(params);
    const authHeaders = {
      Authorization: `Bearer ${imsToken}`,
      "Content-Type": "application/json",
    };

    let url = `https://${params.aemHost}/adobe/sites/cf/fragments`;
    if (this.cfFolderPath.length > 0) {
      url = url + "?path=" + this.cfFolderPath;
    }

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: authHeaders,
      });
     
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`AEM API request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }
      if(response && typeof response === "object") {
        const data = await response.json();
        return data.items;
      } else {
        this.logger.warn("Received no fragments from AEM or unexpected response format");
        return [];
      }
    } catch (error) {
      this.logger.error("Error during AEM API request:", error.message);
      throw new Error(`Failed to fetch content fragments from AEM: ${error.message}`);
    }
  }
}

module.exports = AEMClaimProvider;