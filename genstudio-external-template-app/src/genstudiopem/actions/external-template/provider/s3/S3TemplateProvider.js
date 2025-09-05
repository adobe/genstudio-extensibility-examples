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

const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const {
  S3Client,
  ListObjectsV2Command,
  HeadObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const TemplateProvider = require("../TemplateProvider");

class S3TemplateProvider extends TemplateProvider {
  constructor(params, logger) {
    super(params, logger);
    this.client = new S3Client({
      credentials: {
        accessKeyId: params.AWS_ACCESS_KEY_ID,
        secretAccessKey: params.AWS_SECRET_ACCESS_KEY,
      },
      region: params.AWS_REGION,
    });
    this.bucketName = params.S3_BUCKET_NAME || process.env.S3_BUCKET_NAME;
  }

  async getS3PresignedUrl(key) {
    const getObjCmd = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });
    return await getSignedUrl(this.client, getObjCmd, { expiresIn: 3600 });
  }

  async getThumbnailsMap() {
    const list = await this.client.send(new ListObjectsV2Command({
      Bucket: this.bucketName,
      Prefix: 'templates/thumbnails',
      MaxKeys: 1000
    }));
    const out = {};
    for (const obj of (list.Contents || [])) {
      if (!obj.Key || obj.Key.endsWith('/')) continue;
      const file = obj.Key.split('/').pop();
      if (!file) continue;
      const base = file.replace(/\.[^/.]+$/, '').toLowerCase();
      out[base] = await this.getS3PresignedUrl(obj.Key);
    }
    return out;
  }

  async searchAssets(params) {
    this.logger.info("Searching assets in S3");
    const listHTMLObjectsCmd = new ListObjectsV2Command({
      Bucket: this.bucketName,
      Prefix: 'templates/html',
      MaxKeys: parseInt(params.limit) || 100,
    });
    const listHTMLResult = await this.client.send(listHTMLObjectsCmd);
    const thumbnailsByName = await this.getThumbnailsMap();
    this.logger.info(`Found ${listHTMLResult?.Contents?.length || 0} HTML templates in S3`);

    const templates = (await Promise.all(
      listHTMLResult?.Contents?.map(async (item) => {
        if (item.Key.endsWith('/')) return null;
        const headObjCmd = new HeadObjectCommand({
          Bucket: this.bucketName,
          Key: item.Key,
        });
        try {
          const metadata = await this.client.send(headObjCmd);
          const originalUrl = await this.getS3PresignedUrl(item.Key);
          const base = (item.Key.split('/').pop() || '').replace(/\.[^/.]+$/, '').toLowerCase();
          const thumbnailUrl = thumbnailsByName[base];
          return {
            id: item.Key,
            title: item.Key.split('/').pop() || 'Unknown',
            thumbnailUrl,
            url: originalUrl,
            mapping: {
              contentType: metadata.ContentType,
              size: item.Size,
              ...metadata.Metadata,
            },
          };
        } catch (error) {
          this.logger.error(`Error getting metadata for template ${item.Key}: ${error}`);
          return null;
        }
      })
    )).filter(template => template !== null);

    return {
      statusCode: 200,
      body: { 
        templates: templates
      },
    };
  }

  async doGetAssetUrl(params) {
    this.logger.info("Getting presigned URL for asset", params.assetId);
    const url = await this.getS3PresignedUrl(params.assetId);
    return { statusCode: 200, body: { url } };
  }

  async doGetTemplateAssetUrl(params) {
    this.logger.info("Getting presigned URL for template asset", params.assetId);
    // If templates live under a specific prefix, normalize here
    const key = params.assetId.startsWith("templates/")
      ? params.assetId
      : `templates/${params.assetId}`;
    const url = await this.getS3PresignedUrl(key);
    return { statusCode: 200, body: { url } };
  }

  async doGetAssetMetadata(params) {
    this.logger.info("Getting metadata for asset", params.assetId);
    const headObjCmd = new HeadObjectCommand({
      Bucket: this.bucketName,
      Key: params.assetId,
    });
    const metadata = await this.client.send(headObjCmd);

    return {
      statusCode: 200,
      body: {
        metadata: {
          contentType: metadata.ContentType,
          contentLength: metadata.ContentLength,
          lastModified: metadata.LastModified,
          ...metadata.Metadata,
        },
      },
    };
  }
}

module.exports = S3TemplateProvider;
