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
 * @typedef {Object} Asset - Asset object from @adobe/genstudio-extensibility-sdk
 */

/**
 * @class DamProvider
 * @description
 *   Base class for Digital Asset Management providers.
 *   Uses the Template Method design pattern:
 *   - Public methods handle validation, then delegate to `do` methods.
 *   - Subclasses must override the `do` methods.
 */
class TemplateProvider {
  constructor(params, logger) {
    this.logger = logger;
  }

  /**
   * Template Method for searching assets in the DAM.
   * 1. Validates params via `validateAssetParams`
   * 2. On validation error, throws `ValidationError`
   * 3. Otherwise calls subclass's `doSearchAssets`
   *
   * @param {Object} params
   * @param {string} [params.prefix] prefix to search for
   * @param {number} [params.limit] max number of results
   * @returns {Promise<{statusCode: number, body: {assets: Asset[]}}>}
   * @throws {ValidationError}
   */
  // eslint-disable-next-line no-unused-vars
  async searchAssets(_params) {
    throw new Error("searchAssets() not implemented");
  }
}

module.exports = TemplateProvider;
