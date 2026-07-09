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
 * Custom validation error class
 */
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
  }
}

/**
 * Returns a formatted error response
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {Object} logger - Logger instance
 * @returns {{statusCode: number, body: {error: string}}}
 */
function errorResponse(statusCode, message, logger) {
  logger.error(message);
  return {
    statusCode,
    body: {
      error: message,
    },
  };
}
/**
 *
 * Extracts the bearer token string from the Authorization header in the request parameters.
 *
 * @param {object} params action input parameters.
 *
 * @returns {string|undefined} the token string or undefined if not set in request headers.
 *
 */
function getBearerToken(params) {
  if (
    params.__ow_headers &&
    params.__ow_headers.authorization &&
    params.__ow_headers.authorization.startsWith("Bearer ")
  ) {
    return params.__ow_headers.authorization.substring("Bearer ".length);
  }
  return undefined;
}

module.exports = {
  ValidationError,
  errorResponse,
  getBearerToken,
};
