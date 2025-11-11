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

const lib = require('@adobe/aio-lib-files');
const https = require('https');
const http = require('http');

/**
 * AIO Files Service - A clean abstraction for Adobe I/O Files operations
 * Handles file uploads, presigned URLs, and metadata operations
 */
class AIOFilesService {
  constructor(logger) {
    this.logger = logger;
    this.filesClient = null;
  }

  /**
   * Initialize the AIO Files client
   * @returns {Promise<void>}
   */
  async init() {
    if (!this.filesClient) {
      this.logger.info('Initializing AIO Files client');
      this.filesClient = await lib.init();
      this.logger.info('AIO Files client initialized successfully');
    }
  }

  /**
   * Ensure the client is initialized before operations
   * @private
   */
  async ensureInitialized() {
    if (!this.filesClient) {
      await this.init();
    }
  }

  /**
   * Upload a file from a URL to AIO Files
   * @param {Object} options - Upload options
   * @param {string} options.id - Unique identifier for the file
   * @param {string} options.name - Name of the file to store
   * @param {string} options.url - URL to fetch the file from
   * @returns {Promise<Object>} Upload result with file path and metadata
   */
  async uploadFromURL({ id, name, url }) {
    await this.ensureInitialized();

    this.logger.info(`Uploading file: ${name} (ID: ${id})`);
    this.logger.info(`Source URL: ${url}`);

    // Fetch file from URL
    const startFetch = Date.now();
    const fileData = await this._fetchFileStream(url);
    const fetchDuration = Date.now() - startFetch;
    
    this.logger.info(`File fetched in ${fetchDuration}ms`);
    this.logger.info(`Content-Type: ${fileData.contentType}`);
    this.logger.info(`Content-Length: ${this._formatBytes(fileData.contentLength)}`);

    // Upload to AIO Files
    const filePath = `uploads/${id}/${name}`;
    const startUpload = Date.now();
    await this.filesClient.write(filePath, fileData.stream);
    const uploadDuration = Date.now() - startUpload;
    
    this.logger.info(`File uploaded to ${filePath} in ${uploadDuration}ms`);

    const totalDuration = Date.now() - startFetch;
    this.logger.info(`Upload operation completed in ${totalDuration}ms`);

    return {
      filePath,
      metadata: {
        contentType: fileData.contentType,
        size: this._formatBytes(fileData.contentLength),
        sizeBytes: fileData.contentLength
      },
      performance: {
        fetchDurationMs: fetchDuration,
        uploadDurationMs: uploadDuration,
        totalDurationMs: totalDuration
      }
    };
  }

  /**
   * Generate a presigned URL for a file
   * @param {string} filePath - Path to the file in AIO Files
   * @param {number} [expiryInSeconds=3600] - Expiry time in seconds
   * @returns {Promise<string>} Presigned URL
   */
  async generatePresignedURL(filePath, expiryInSeconds = 86400) {
    await this.ensureInitialized();

    this.logger.info(`Generating presigned URL for: ${filePath}`);
    const url = await this.filesClient.generatePresignURL(filePath, {
      expiryInSeconds
    });
    
    this.logger.info(`Presigned URL generated (expires in ${expiryInSeconds}s)`);
    return url;
  }

  /**
   * Get metadata for a file
   * @param {string} filePath - Path to the file in AIO Files
   * @returns {Promise<Object>} File metadata
   */
  async getFileMetadata(filePath) {
    await this.ensureInitialized();

    this.logger.info(`Retrieving metadata for: ${filePath}`);
    const properties = await this.filesClient.getProperties(filePath);
    
    return {
      path: filePath,
      size: this._formatBytes(properties.contentLength || 0),
      sizeBytes: properties.contentLength || 0,
      contentType: properties.contentType,
      lastModified: properties.lastModified,
      isDirectory: properties.isDirectory,
      isPublic: properties.isPublic
    };
  }

  /**
   * Write content directly to AIO Files
   * @param {string} filePath - Destination path
   * @param {*} content - Content to write (stream, buffer, or string)
   * @returns {Promise<string>} File path
   */
  async writeFile(filePath, content) {
    await this.ensureInitialized();

    this.logger.info(`Writing file to: ${filePath}`);
    await this.filesClient.write(filePath, content);
    this.logger.info('File written successfully');
    
    return filePath;
  }

  /**
   * Fetch a file from URL and return a readable stream with metadata
   * @private
   * @param {string} url - The URL to fetch
   * @returns {Promise<Object>} Stream and metadata
   */
  async _fetchFileStream(url) {
    return new Promise((resolve, reject) => {
      const protocol = url.startsWith('https') ? https : http;
      
      protocol.get(url, (response) => {
        // Handle redirects
        if (response.statusCode === 301 || response.statusCode === 302) {
          if (response.headers.location) {
            this._fetchFileStream(response.headers.location)
              .then(resolve)
              .catch(reject);
            return;
          }
        }
        
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to fetch file: HTTP ${response.statusCode}`));
          return;
        }
        
        resolve({
          stream: response,
          contentType: response.headers['content-type'] || 'application/octet-stream',
          contentLength: parseInt(response.headers['content-length'] || '0', 10)
        });
      }).on('error', reject);
    });
  }

  /**
   * Format bytes to human-readable format
   * @private
   * @param {number} bytes - Number of bytes
   * @returns {string} Formatted string
   */
  _formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

module.exports = AIOFilesService;
