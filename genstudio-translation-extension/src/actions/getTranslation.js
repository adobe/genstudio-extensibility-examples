/*
* <license header>
*/

/**
 * This is a sample action showcasing how to access an external API
 *
 * Note:
 * You might want to disable authentication and authorization checks against Adobe Identity Management System for a generic action. In that case:
 *   - Remove the require-adobe-auth annotation for this action in the manifest.yml of your application
 *   - Remove the Authorization header from the array passed in checkMissingRequestInputs
 *   - The two steps above imply that every client knowing the URL to this deployed action will be able to invoke it without any authentication and authorization checks against Adobe Identity Management System
 *   - Make sure to validate these changes against your security requirements before deploying the action
 */

const { Core } = require('@adobe/aio-sdk')
const { errorResponse, stringParameters } = require('./utils')
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
  });
};

/**
 * Calls Azure OpenAI API for translation
 * @param {AzureOpenAI} client - Azure OpenAI client
 * @param {Object} params - Request parameters
 * @param {string} sourceLocale - Source locale
 * @param {Array} targetLocales - Target locales
 * @param {Array} items - Items to translate
 * @returns {Object} Azure OpenAI response
 */
const callTranslationAPI = async (client, params, sourceLocale, targetLocales, items) => {
  return await client.chat.completions.create({
    model: params.AZURE_OPENAI_DEPLOYMENT_NAME,
    temperature: 0.0,
    top_p: 1.0,
    frequency_penalty: 0.0,
    presence_penalty: 0.0,
    response_format: { type: 'json_schema', json_schema: OPENAI_TRANSLATION_RESPONSE_SCHEMA },
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: JSON.stringify({ sourceLocale, targetLocales, items }) },
    ],
  });
};

/**
 * Processes the translation response and builds results
 * @param {Object} parsedResponse - Parsed API response
 * @param {Array} targetLocales - Target locales
 * @param {Object} logger - Logger instance
 * @returns {Object} Results object or error response
 */
const processTranslationResponse = (parsedResponse, targetLocales, logger) => {
  if (!parsedResponse.targetLocale || !parsedResponse.items) {
    logger.error('Invalid response format from Azure OpenAI API:', parsedResponse);
    return { error: errorResponse(500, 'Invalid response format from translation service', logger) };
  }

  const results = {};
  const translatedItems = parsedResponse.items;
  
  for (const targetLocale of targetLocales) {
    results[targetLocale] = translatedItems.map(item => ({
      id: item.id,
      messages: item.messages.map(message => ({
        id: message.id,
        value: message.value
      }))
    }));
  }

  return { results };
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
    const response = await callTranslationAPI(client, params, sourceLocale, targetLocales, items);
    
    const rawResponse = response.choices[0].message?.content || '[]';
    const parsedResponse = JSON.parse(rawResponse);
    
    logger.debug('response', parsedResponse);
    
    const processResult = processTranslationResponse(parsedResponse, targetLocales, logger);
    if (processResult.error) {
      return processResult.error;
    }
    
    return {
      status: 200,
      results: processResult.results
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

  try {
    logger.info('Calling the main action');
    logger.debug(stringParameters(params));

    // Extract parameters
    const paramResult = extractParameters(params, logger);
    if (paramResult.error) {
      return paramResult.error;
    }
    
    const { sourceLocale, targetLocales, items } = paramResult;

    // Validate parameters
    const validationError = validateParameters(sourceLocale, targetLocales, items, logger);
    if (validationError) {
      return validationError;
    }

    // Get translation
    const translationResponse = await getTranslation(params, sourceLocale, targetLocales, items);
    
    const response = {
      statusCode: 200,
      body: {
        translation: translationResponse
      }
    };

    logger.info(`${response.statusCode}: successful request`);
    return response;
  } catch (error) {
    logger.error('Unexpected error:', error);
    return {
      error: {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }
    };
  }
}

exports.main = main;
