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

async function searchAssets(params) {
  const client = new S3Client({
    credentials: {
      accessKeyId: params.AWS_ACCESS_KEY_ID,
      secretAccessKey: params.AWS_SECRET_ACCESS_KEY,
    },
    region: params.AWS_REGION,
  });

  const bucketName = params.S3_BUCKET_NAME;

  const getS3PresignedUrl = async (key) => {
    const getObjCmd = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });
    return await getSignedUrl(client, getObjCmd, { expiresIn: 3600 });
  };

  const getThumbnailUrl = async (key) => {
    const thumbnailKey =
      "thumbnails/" + key.replace("assets/", "").replace(/\.[^/.]+$/, ".jpg");
    return await getS3PresignedUrl(thumbnailKey);
  };

  const listObjectsCmd = new ListObjectsV2Command({
    Bucket: bucketName,
    Prefix: "assets/",
    MaxKeys: 100,
  });

  const listResult = await client.send(listObjectsCmd);

  const assets = (
    await Promise.all(
      listResult?.Contents?.map(async (item) => {
        if (item.Key.endsWith("/")) return null;
        const headObjCmd = new HeadObjectCommand({
          Bucket: bucketName,
          Key: item.Key,
        });
        try {
          const metadata = await client.send(headObjCmd);
          const originalUrl = await getS3PresignedUrl(item.Key);
          const thumbnailUrl = await getThumbnailUrl(item.Key);

          return {
            id: item.Key,
            mimeType: metadata.ContentType,
            name: item.Key.split("/").pop() || "Unknown",
            size: item.Size,
            externalAssetInfo: {
              sourceUrl: originalUrl,
              signedUrl: originalUrl,
              signedThumbnailUrl: thumbnailUrl,
            },
            keywords: ["S3Asset"],
          };
        } catch (error) {
          console.error(`Error getting metadata for asset ${item.Key}:`, error);
          return null;
        }
      }) || []
    )
  ).filter((asset) => asset !== null);

  return {
    statusCode: 200,
    body: {
      assets: assets,
    },
  };
}

async function main(params) {
  try {
    // Get AWS credentials from environment or params
    const awsAccessKeyId = params.AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
    const awsSecretAccessKey = params.AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;
    const awsRegion = params.AWS_REGION || process.env.AWS_REGION;
    const s3BucketName = params.S3_BUCKET_NAME || process.env.S3_BUCKET_NAME;

    if (!awsAccessKeyId || !awsSecretAccessKey || !awsRegion || !s3BucketName) {
      return {
        statusCode: 400,
        body: {
          error: "Missing AWS credentials (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, S3_BUCKET_NAME)",
        },
      };
    }

    const result = await searchAssets({
      AWS_ACCESS_KEY_ID: awsAccessKeyId,
      AWS_SECRET_ACCESS_KEY: awsSecretAccessKey,
      AWS_REGION: awsRegion,
      S3_BUCKET_NAME: s3BucketName,
    });

    return result;
  } catch (error) {
    console.error("Error in search action:", error);
    return {
      statusCode: 500,
      body: {
        error: error.message || "Internal server error",
      },
    };
  }
}

exports.main = main;
