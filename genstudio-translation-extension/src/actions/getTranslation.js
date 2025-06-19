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
const { errorResponse, stringParameters, checkMissingRequestInputs } = require('./utils')

/**
 * @typedef {import('@adobe/genstudio-extensibility-sdk').TranslationResponse} TranslationResponse
 * @typedef {import('@adobe/genstudio-extensibility-sdk').TranslationItem} TranslationItem
 * @typedef {import('@adobe/genstudio-extensibility-sdk').TranslationMessage} TranslationMessage
 */

/**
 * Generates translation response for given source locale, target locales, and items
 * @param {string} sourceLocale - The source locale code
 * @param {string[]} targetLocales - Array of target locale codes
 * @param {TranslationItem[]} items - Array of items to translate
 * @returns {TranslationResponse} The translation response
 */
const getTranslation = (sourceLocale, targetLocales, items) => {
  const results = {}
  
  for (const targetLocale of targetLocales) {
    results[targetLocale] = items.map(item => ({
      id: item.id,
      messages: item.messages.map(message => ({
        id: message.id,
        value: `Translated ${message.id} from ${sourceLocale} to ${targetLocale}`
      }))
    }))
  }
  
  const response = {
    status: 200,
    results
  }
 
  return response
}

async function main (params) {
  const logger = Core.Logger('main', { level: params.LOG_LEVEL || 'info' })

  try {
    logger.info('Calling the main action')

    logger.debug(stringParameters(params))

    const requiredParams = ['sourceLocale', 'targetLocales', 'items']
    const requiredHeaders = ['Authorization']
    const errorMessage = checkMissingRequestInputs(params, requiredParams, requiredHeaders)
    if (errorMessage) {
      return errorResponse(400, errorMessage, logger)
    }
    
    // Parse and validate input parameters
    const { sourceLocale, targetLocales, items } = params
    
    if (!Array.isArray(targetLocales) || targetLocales.length === 0) {
      return errorResponse(400, 'targetLocales must be a non-empty array', logger)
    }
    
    if (!Array.isArray(items) || items.length === 0) {
      return errorResponse(400, 'items must be a non-empty array', logger)
    }
    
    const translationResponse = getTranslation(sourceLocale, targetLocales, items)
    
    const response = {
      statusCode: 200,
      body: {
        translation: translationResponse
      }
    }

    logger.info(`${response.statusCode}: successful request`)
    return response
  } catch (error) {
    logger.error(error)
    return {
      error: {
        statusCode: 500,
        body: { error: 'server error' }
      }
    }
  }
}

exports.main = main
