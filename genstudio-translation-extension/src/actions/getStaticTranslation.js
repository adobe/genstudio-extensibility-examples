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
const { AzureOpenAI } = require('openai');

/**
 * @typedef {import('@adobe/genstudio-extensibility-sdk').TranslationResponse} TranslationResponse
 * @typedef {import('@adobe/genstudio-extensibility-sdk').TranslationItem} TranslationItem
 * @typedef {import('@adobe/genstudio-extensibility-sdk').TranslationMessage} TranslationMessage
 */

const SYSTEM_PROMPT = `
  You are a translation assistant. Always respond in provided JSON schema.
  Translate only the 'text' field from the source language to the target language.
  Preserve message IDs and do not modify keys.
  Preserve meaning and make it sound like a marketing slogan.
  No extra text. No comments.
`;

const OPENAI_TRANSLATION_RESPONSE_SCHEMA = {
  name: 'openai_translation_response',
  strict: true,
  schema: {
    type: 'object',
    properties: {
      targetLocale: { type: 'string' },
      items: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            messages: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  value: { type: 'string' },
                },
                required: ['id', 'value'],
                additionalProperties: false,
              },
            },
          },
          required: ['id', 'messages'],
          additionalProperties: false,
        },
      },
    },
    required: ['targetLocale', 'items'],
    additionalProperties: false,
  },
};

/**
 * Validates required environment variables
 * @param {Object} params - Request parameters
 * @param {Object} logger - Logger instance
 * @returns {Object|null} Error response if validation fails, null if valid
 */
const validateEnvironment = (params, logger) => {
  const requiredVars = ['AZURE_OPENAI_API_KEY', 'AZURE_OPENAI_ENDPOINT', 'AZURE_OPENAI_API_VERSION', 'AZURE_OPENAI_DEPLOYMENT_NAME'];
  const missing = requiredVars.filter(varName => !params[varName]);
  
  if (missing.length > 0) {
    logger.error('Missing required environment variables:', missing);
    return errorResponse(500, `Missing required environment variables: ${missing.join(', ')}`, logger);
  }
  return null;
};

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
 * Creates Azure OpenAI client
 * @param {Object} params - Request parameters
 * @returns {AzureOpenAI} Azure OpenAI client instance
 */
const createAzureOpenAIClient = (params) => {
  return new AzureOpenAI({
    apiKey: params.AZURE_OPENAI_API_KEY,
    endpoint: params.AZURE_OPENAI_ENDPOINT,
    apiVersion: params.AZURE_OPENAI_API_VERSION,
    timeout: 30000, // 30 second timeout
  });
};

/**
 * Calls Azure OpenAI API for translation
 * @param {AzureOpenAI} client - Azure OpenAI client
 * @param {Object} params - Request parameters
 * @param {string} sourceLocale - Source locale
 * @param {string} targetLocale - Target locale
 * @param {Array} items - Items to translate
 * @returns {Object} Azure OpenAI response
 */
const callTranslationAPI = async (client, params, sourceLocale, targetLocale, items) => {
  const responseS = {
      name: 'openai_translation_response',
      strict: true,
      schema: {
        type: 'object',
        properties: {
          targetLocale: { type: 'fr' },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                messages: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      value: { type: 'string' },
                    },
                    required: ['id', 'value'],
                    additionalProperties: false,
                  },
                },
              },
              required: ['id', 'messages'],
              additionalProperties: false,
            },
          },
        },
        required: ['targetLocale', 'items'],
        additionalProperties: false,
      },
    };
    return responseS;
  // return await client.chat.completions.create({
  //   model: params.AZURE_OPENAI_DEPLOYMENT_NAME,
  //   temperature: 0.0,
  //   top_p: 1.0,
  //   frequency_penalty: 0.0,
  //   presence_penalty: 0.0,
  //   response_format: { type: 'json_schema', json_schema: OPENAI_TRANSLATION_RESPONSE_SCHEMA },
  //   messages: [
  //     { role: 'system', content: SYSTEM_PROMPT },
  //     { role: 'user', content: JSON.stringify({ sourceLocale, targetLocale, items }) },
  //   ],
  // });
};

/**
 * Processes the translation response for a single target locale
 * @param {Object} parsedResponse - Parsed API response
 * @param {string} targetLocale - Target locale
 * @param {Object} logger - Logger instance
 * @returns {Object} Results object or error response
 */
const processTranslationResponse = (parsedResponse, targetLocale, logger) => {
  if (!parsedResponse.targetLocale || !parsedResponse.items) {
    logger.error('Invalid response format from Azure OpenAI API:', parsedResponse);
    return { error: errorResponse(500, 'Invalid response format from translation service', logger) };
  }

  const translatedItems = parsedResponse.items;
  
  return {
    items: translatedItems.map(item => ({
      id: item.id,
      messages: item.messages.map(message => ({
        id: message.id,
        value: message.value
      }))
    }))
  };
};

/**
 * Generates translation response for given source locale, target locales, and items
 * @param {Object} params - Request parameters
 * @param {string} sourceLocale - The source locale code
 * @param {Array} targetLocales - Array of target locale codes
 * @param {Array} items - Array of items to translate
 * @returns {TranslationResponse} The translation response
 */
const getTranslation = async (params, sourceLocale, targetLocales, items) => {
  const logger = Core.Logger('getTranslation', { level: params.LOG_LEVEL || 'info' });
  
  try {
    const client = createAzureOpenAIClient(params);
    const results = {};
    
    // Translate for each target locale separately
    for (const targetLocale of targetLocales) {
      try {
        const response = await callTranslationAPI(client, params, sourceLocale, targetLocale, items);
      
      const rawResponse = response.choices[0]?.message?.content;
      if (!rawResponse) {
        logger.error(`Empty response from Azure OpenAI API for locale ${targetLocale}`);
        return errorResponse(500, 'Empty response from translation service', logger);
      }
      
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(rawResponse);
      } catch (parseError) {
        logger.error(`Failed to parse response for locale ${targetLocale}:`, parseError);
        return errorResponse(500, 'Invalid JSON response from translation service', logger);
      }
      
      logger.debug(`response for ${targetLocale}:`, parsedResponse);
      
      const processResult = processTranslationResponse(parsedResponse, targetLocale, logger);
      if (processResult.error) {
        return processResult.error;
      }
      
      results[targetLocale] = processResult.items;
      } catch (error) {
        logger.error(`Failed to translate for locale ${targetLocale}:`, error);
        return errorResponse(500, `Translation failed for locale ${targetLocale}: ${error.message}`, logger);
      }
    }
    
    return {
      status: 200,
      results
    };
  } catch (error) {
    logger.error('Failed to process translation request:', error);
    return errorResponse(500, 'Failed to process translation request', logger);
  }
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
    // Validate environment variables first
    // const envError = validateEnvironment(params, logger);
    // if (envError) {
    //   return {
    //     statusCode: envError.error.statusCode,
    //     body: envError.error.body
    //   };
    // }

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

    const translationResponse = await getTranslation(params, sourceLocale, targetLocales, items);
    
    const response = {
      statusCode: translationResponse.status === 200 ? 200 : translationResponse.status,
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
