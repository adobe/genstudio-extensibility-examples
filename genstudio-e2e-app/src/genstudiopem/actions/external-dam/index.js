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

async function main(params) {
  const client = new S3Client({
    credentials: {
      accessKeyId: params.AWS_ACCESS_KEY_ID,
      secretAccessKey: params.AWS_SECRET_ACCESS_KEY,
    },
    region: params.AWS_REGION,
  });

  const bucket = params.S3_BUCKET_NAME;
  const { Contents = [] } = await client.send(
    new ListObjectsV2Command({ Bucket: bucket, Prefix: "e2e/dam/" })
  );

  const assets = await Promise.all(
    Contents.filter((item) => !item.Key.endsWith("/")).map(async (item) => {
      const [presignedUrl, head] = await Promise.all([
        getSignedUrl(
          client,
          new GetObjectCommand({ Bucket: bucket, Key: item.Key }),
          { expiresIn: 3600 }
        ),
        client.send(new HeadObjectCommand({ Bucket: bucket, Key: item.Key })),
      ]);
      return {
        id: item.Key,
        name: item.Key.split("/").pop(),
        mimeType: head.ContentType,
        size: item.Size,
        externalAssetInfo: {
          sourceUrl: presignedUrl,
          signedUrl: presignedUrl,
          signedThumbnailUrl: presignedUrl,
        },
      };
    })
  );

  return { statusCode: 200, body: { assets } };
}

exports.main = main;
