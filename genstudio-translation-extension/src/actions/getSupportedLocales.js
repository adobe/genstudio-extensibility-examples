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
const { stringParameters } = require('./utils')

/** @type {import('@adobe/genstudio-extensibility-sdk').Locale[]} */
const SUPPORTED_LOCALES = [
  { code: 'fr-FR', label: 'French' },
  { code: 'de-DE', label: 'German' },
  { code: 'it-IT', label: 'Italian' },
  { code: 'es-ES', label: 'Spanish (Spain)' },
  { code: 'th-TH', label: 'Thai' },
]

async function main (params) {
  const logger = Core.Logger('main', { level: params.LOG_LEVEL || 'info' })
  logger.info('Calling the get supported locales action')
  logger.debug(stringParameters(params))

  try { 
    const response = {
      statusCode: 200,
      body: {
        locales: SUPPORTED_LOCALES
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
