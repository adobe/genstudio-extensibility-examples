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
const lib = require('@adobe/aio-lib-files');
const https = require('https');
const http = require('http');

/**
 * Fetches a file from a URL and returns a readable stream with metadata
 * @param {string} url - The URL to fetch the file from
 * @returns {Promise<Object>} Object containing stream, contentType, and contentLength
 */
async function fetchFileStream(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        if (response.headers.location) {
          fetchFileStream(response.headers.location).then(resolve).catch(reject);
          return;
        }
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to fetch file: HTTP ${response.statusCode}`));
        return;
      }
      
      const metadata = {
        stream: response,
        contentType: response.headers['content-type'] || 'application/octet-stream',
        contentLength: parseInt(response.headers['content-length'] || '0', 10)
      };
      
      resolve(metadata);
    }).on('error', reject);
  });
}

/**
 * Formats bytes to human-readable format
 * @param {number} bytes - Number of bytes
 * @returns {string} Formatted string (e.g., "5.2 MB")
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Main action to upload a file from URL to AIO Files
 * @param {Object} params - Action parameters
 * @param {string} params.id - Unique identifier for the file
 * @param {string} params.name - Name of the file to store
 * @param {string} params.url - URL to fetch the file from
 * @param {number} [params.expiryInSeconds=3600] - Presigned URL expiry time in seconds
 * @returns {Promise<Object>} Response object
 */
exports.main = async (params) => {
  const logger = Core.Logger("main", { level: params.LOG_LEVEL || "info" });
  
  try {
    const { id, name, url, expiryInSeconds = 3600 } = params;
    
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
          error: "Bad Request",
          message: message,
          missingParameters: missingParams
        }
      };
    }
    
    logger.info(`Starting file upload for fileId: ${id}`);
    logger.info(`File name: ${name}`);
    logger.info(`Source URL: ${url}`);
    
    // Initialize AIO Files
    logger.info("Initializing AIO Lib Files");
    const files = await lib.init();
    logger.info("AIO Lib Files initialized successfully");
    
    // Fetch file from URL
    logger.info("Fetching file from URL...");
    const startFetch = Date.now();
    const fileData = await fetchFileStream(url);
    const fetchDuration = Date.now() - startFetch;
    logger.info(`File fetched successfully in ${fetchDuration}ms`);
    logger.info(`Content-Type: ${fileData.contentType}`);
    logger.info(`Content-Length: ${formatBytes(fileData.contentLength)}`);
    
    // Upload to AIO Files
    const filePath = `uploads/${id}/${name}`;
    logger.info(`Uploading file to path: ${filePath}`);
    const startUpload = Date.now();
    await files.write(filePath, fileData.stream);
    const uploadDuration = Date.now() - startUpload;
    logger.info(`File uploaded successfully in ${uploadDuration}ms`);
    
    // Generate presigned URL
    logger.info("Generating presigned URL...");
    const startPresign = Date.now();
    const presignedUrl = await files.generatePresignURL(filePath, {
      expiryInSeconds: expiryInSeconds,
    });
    const presignDuration = Date.now() - startPresign;
    logger.info(`Presigned URL generated successfully in ${presignDuration}ms`);
    
    const totalDuration = Date.now() - startFetch;
    logger.info(`Total operation completed in ${totalDuration}ms`);
    
    return {
      statusCode: 200,
      body: {
        message: "File uploaded successfully",
        fileId: id,
        fileName: name,
        filePath: filePath,
        presignedUrl: presignedUrl,
        metadata: {
          contentType: fileData.contentType,
          size: formatBytes(fileData.contentLength),
          sizeBytes: fileData.contentLength
        },
        performance: {
          fetchDurationMs: fetchDuration,
          uploadDurationMs: uploadDuration,
          presignDurationMs: presignDuration,
          totalDurationMs: totalDuration
        }
      }
    };
  } catch (error) {
    logger.error("Error during file upload operation");
    logger.error(error);
    
    return {
      statusCode: 500,
      body: {
        error: "Internal Server Error",
        message: "Failed to upload file",
        details: error.message
      }
    };
  }
};
