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
 * Generate a presigned URL for an existing file in AIO Files
 * @param {Object} params - Action parameters
 * @param {string} params.filePath - Path to the file in AIO Files
 * @param {number} [params.expiryInSeconds=3600] - Expiry time in seconds
 * @returns {Promise<Object>} Response object with presigned URL
 */
exports.main = async (params) => {
  const logger = Core.Logger("main", { level: params.LOG_LEVEL || "info" });

  try {
    const { filePath, expiryInSeconds = 3600 } = params;

    // Validate required parameters
    if (!filePath) {
      const message = "Missing required parameter: filePath";
      logger.error(message);
      return {
        statusCode: 400,
        body: {
          error: message
        }
      };
    }

    logger.info(`Generating presigned URL for: ${filePath}`);

    // Use AIO Files Service to generate presigned URL
    const filesService = new AIOFilesService(logger);
    const presignedUrl = await filesService.generatePresignedURL(filePath, expiryInSeconds);

    return {
      statusCode: 200,
      body: {
        url: presignedUrl
      }
    };
  } catch (error) {
    logger.error("Error generating presigned URL");
    logger.error(error);

    return {
      statusCode: 500,
      body: {
        error: error.message || "Failed to generate presigned URL"
      }
    };
  }
};
