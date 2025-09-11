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
 * Custom error type thrown when validation of request inputs fails.
 * @extends Error
 */
class ValidationError extends Error {}

/**
 * Returns and logs an err response obj (for returning from your action's main()).
 *
 * @param {number} statusCode - HTTP status code for the error
 * @param {string} message - human-readable error message
 * @param {object} logger - logger instance with an error(message) method
 * @returns {{ error: { statusCode: number, body: { error: string } } }}
 *
 * @example
 * // inside your action’s main():
 * const logger = Core.Logger('main', { level: 'info' });
 * return errorResponse(400, 'Unsupported action type', logger);
 */
function errorResponse(statusCode, message, logger) {
  logger.error(message);
  return { error: { statusCode, body: { error: message } } };
}

/**
 * An example common mapping for all sample templates, but usually you would use a different mapping for each template
 * This is used to map the template content to the GenStudio content
 */
const COMMON_MAPPING = {
  // no pod
  head: "headline",
  head1: "headline",
  head2: "headline",
  subhead: "sub_headline",
  subhead1: "sub_headline",
  subhead2: "sub_headline",
  content: "body",
  content1: "body",
  content2: "body",
  btn: "cta",
  btn1: "cta",
  btn2: "cta",
  else: "other",
  else1: "other",
  else2: "other",
  // pod1
  pod1_head: "headline",
  pod1_head1: "headline",
  pod1_head2: "headline",
  pod1_subhead: "sub_headline",
  pod1_subhead1: "sub_headline",
  pod1_subhead2: "sub_headline",
  pod1_content: "body",
  pod1_content1: "body",
  pod1_content2: "body",
  pod1_btn: "cta",
  pod1_btn1: "cta",
  pod1_btn2: "cta",
  pod1_else: "other",
  pod1_else1: "other",
  pod1_else2: "other",
  // pod2
  pod2_head: "headline",
  pod2_head1: "headline",
  pod2_head2: "headline",
  pod2_subhead: "sub_headline",
  pod2_subhead1: "sub_headline",
  pod2_subhead2: "sub_headline",
  pod2_content: "body",
  pod2_content1: "body",
  pod2_content2: "body",
  pod2_btn: "cta",
  pod2_btn1: "cta",
  pod2_btn2: "cta",
  pod2_else: "other",
  pod2_else1: "other",
  pod2_else2: "other",
};

module.exports = {
  COMMON_MAPPING,
  errorResponse,
  ValidationError,
};
