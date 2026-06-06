/*
 * Copyright 2025 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

const { Core } = require('@adobe/aio-sdk')
const { stringParameters, errorResponse } = require('./utils')

/**
 * @typedef {import('@adobe/genstudio-extensibility-sdk').TranslationResponse} TranslationResponse
 * @typedef {import('@adobe/genstudio-extensibility-sdk').TranslationItem} TranslationItem
 * @typedef {import('@adobe/genstudio-extensibility-sdk').TranslationMessage} TranslationMessage
 */

/**
 * Extracts parameters from request body or params
 * @param {Object} params - Request parameters
 * @param {Object} logger - Logger instance
 * @returns {Object} Extracted parameters or error response
 */
const extractParameters = (params, logger) => {
  let sourceLocale, targetLocales, items;

  if (params.__ow_body) {
    try {
      const body = JSON.parse(params.__ow_body);
      sourceLocale = body.sourceLocale;
      targetLocales = body.targetLocales;
      items = body.items;
    } catch (parseError) {
      logger.error('Failed to parse JSON body:', parseError);
      return { error: errorResponse(400, 'Invalid JSON in request body', logger) };
    }
  } else {
    sourceLocale = params.sourceLocale;
    targetLocales = params.targetLocales;
    items = params.items;
  }

  return { sourceLocale, targetLocales, items };
};

/**
 * Validates required parameters
 * @param {string} sourceLocale - Source locale
 * @param {Array} targetLocales - Target locales
 * @param {Array} items - Items to translate
 * @param {Object} logger - Logger instance
 * @returns {Object|null} Error response if validation fails, null if valid
 */
const validateParameters = (sourceLocale, targetLocales, items, logger) => {
  if (!sourceLocale) {
    return errorResponse(400, 'sourceLocale is required', logger);
  }

  if (!Array.isArray(targetLocales) || targetLocales.length === 0) {
    return errorResponse(400, 'targetLocales must be a non-empty array', logger);
  }

  if (!Array.isArray(items) || items.length === 0) {
    return errorResponse(400, 'items must be a non-empty array', logger);
  }

  return null;
};

/**
 * Produces a mock translation for a single item and target locale.
 *
 * This sample extension does NOT call a real translation engine. To keep the
 * example self-contained, each message value is replaced with a placeholder of
 * the form: `Translated <original value> to <target locale>`. Replace this with
 * a call to your own translation service for a production implementation.
 *
 * @param {TranslationItem} item - The item to translate
 * @param {string} targetLocale - The target locale code
 * @returns {TranslationItem} The translated item
 */
const translateItem = (item, targetLocale) => ({
  id: item.id,
  messages: item.messages.map(message => ({
    id: message.id,
    value: `Translated ${message.value} to ${targetLocale}`,
  })),
});

/**
 * Generates a mock translation response for the given source locale, target
 * locales, and items.
 *
 * @param {string} sourceLocale - The source locale code
 * @param {string[]} targetLocales - Array of target locale codes
 * @param {TranslationItem[]} items - Array of items to translate
 * @param {Object} logger - Logger instance
 * @returns {TranslationResponse} The translation response
 */
const getTranslation = (sourceLocale, targetLocales, items, logger) => {
  const results = {};

  // Produce a placeholder translation for each target locale separately.
  for (const targetLocale of targetLocales) {
    results[targetLocale] = items.map(item => translateItem(item, targetLocale));
    logger.debug(`mock translation generated for ${targetLocale}`);
  }

  return {
    status: 200,
    results,
  };
};

/**
 * Main function handler
 * @param {Object} params - Request parameters
 * @returns {Object} Response object
 */
async function main(params) {
  const logger = Core.Logger('main', { level: params.LOG_LEVEL || 'info' });
  logger.info('Calling the get translation action');
  logger.debug(stringParameters(params));

  try {
    const paramResult = extractParameters(params, logger);
    if (paramResult.error) {
      return {
        statusCode: paramResult.error.status,
        body: paramResult.error
      };
    }

    const { sourceLocale, targetLocales, items } = paramResult;

    const validationError = validateParameters(sourceLocale, targetLocales, items, logger);
    if (validationError) {
      return {
        statusCode: validationError.status,
        body: validationError
      };
    }

    const translationResponse = getTranslation(sourceLocale, targetLocales, items, logger);

    const response = {
      statusCode: translationResponse.status,
      body: translationResponse
    };

    logger.info(`${response.statusCode}: successful request`);
    return response;
  } catch (error) {
    logger.error('Unexpected error:', error);
    return errorResponse(500, 'Internal server error', logger);
  }
}

exports.main = main;
