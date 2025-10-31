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

const { Core } = require("@adobe/aio-sdk");
const AIOFilesService = require('./AIOFilesService');

/**
 * Main action to upload a file from URL to AIO Files
 * @param {Object} params - Action parameters
 * @param {string} params.id - Unique identifier for the file
 * @param {string} params.name - Name of the file to store
 * @param {string} params.url - URL to fetch the file from
 * @returns {Promise<Object>} Response object
 */
exports.main = async (params) => {
  const logger = Core.Logger("main", { level: params.LOG_LEVEL || "info" });
  
  try {
    const { id, name, url } = params;
    
    // Validate required parameters
    const missingParams = [];
    if (!id) missingParams.push('id');
    if (!name) missingParams.push('name');
    if (!url) missingParams.push('url');
    
    if (missingParams.length > 0) {
      const message = `Missing required parameter${missingParams.length > 1 ? 's' : ''}: ${missingParams.join(', ')}`;
      logger.error(message);
      return {
        statusCode: 400,
        body: {
          error: message
        }
      };
    }
    
    logger.info(`Starting file upload for fileId: ${id}`);
    
    // Use AIO Files Service for upload
    const filesService = new AIOFilesService(logger);
    
    // Upload the file
    const uploadResult = await filesService.uploadFromURL({
      id,
      name,
      url
    });
    
    return {
      statusCode: 200,
      body: {
        filePath: uploadResult.filePath
      }
    };
  } catch (error) {
    logger.error("Error during file upload operation");
    logger.error(error);
    
    return {
      statusCode: 500,
      body: {
        error: error.message || "Failed to upload file"
      }
    };
  }
};
