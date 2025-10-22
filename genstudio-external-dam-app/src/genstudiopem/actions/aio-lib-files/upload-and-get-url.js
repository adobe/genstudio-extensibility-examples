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
 * Upload original and thumbnail files, return presigned URLs for both
 * 
 * @param {Object} params - Action parameters
 * @param {string} params.id - Unique identifier for the asset
 * @param {string} params.name - Name of the file to store
 * @param {string} params.originalUrl - URL to fetch the original file from
 * @param {string} params.thumbnailUrl - URL to fetch the thumbnail from
 * @returns {Promise<Object>} Response with both file paths and presigned URLs
 */
exports.main = async (params) => {
  const logger = Core.Logger("main", { level: params.LOG_LEVEL || "info" });
  
  try {
    const { id, name, originalUrl, thumbnailUrl } = params;
    
    // Validate required parameters
    const missingParams = [];
    if (!id) missingParams.push('id');
    if (!name) missingParams.push('name');
    if (!originalUrl) missingParams.push('originalUrl');
    if (!thumbnailUrl) missingParams.push('thumbnailUrl');
    
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
    
    logger.info(`Uploading asset ${id}: ${name}`);
    
    // Use AIO Files Service for the complete workflow
    const filesService = new AIOFilesService(logger);
    
    // Parallelize the entire workflow for both files (upload + URL generation)
    logger.info('Processing original and thumbnail in parallel...');
    const [originalData, thumbnailData] = await Promise.all([
      // Original workflow: upload then generate URL
      (async () => {
        const result = await filesService.uploadFromURL({
          id: `${id}/original`,
          name,
          url: originalUrl
        });
        const presignedUrl = await filesService.generatePresignedURL(result.filePath);
        return {
          path: result.filePath,
          url: presignedUrl
        };
      })(),
      // Thumbnail workflow: upload then generate URL
      (async () => {
        const result = await filesService.uploadFromURL({
          id: `${id}/thumbnail`,
          name,
          url: thumbnailUrl
        });
        const presignedUrl = await filesService.generatePresignedURL(result.filePath);
        return {
          path: result.filePath,
          url: presignedUrl
        };
      })()
    ]);
    
    logger.info('Upload and share workflow completed successfully');
    
    return {
      statusCode: 200,
      body: {
        originalPath: originalData.path,
        originalUrl: originalData.url,
        thumbnailPath: thumbnailData.path,
        thumbnailUrl: thumbnailData.url
      }
    };
  } catch (error) {
    logger.error("Error during upload and get URL operation");
    logger.error(error);
    
    return {
      statusCode: 500,
      body: {
        error: error.message || "Failed to upload file and generate URL"
      }
    };
  }
};
