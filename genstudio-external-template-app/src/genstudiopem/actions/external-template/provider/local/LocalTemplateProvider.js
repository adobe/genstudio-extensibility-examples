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

const TemplateProvider = require("../TemplateProvider");
const {
  noPodTemplateContent,
  noPodDuplicateFieldsTemplateContent,
  twoPodTemplateContent,
  twoPodDuplicateFieldsTemplateContent,
} = require("./Template");
const { COMMON_MAPPING } = require("../../../utils");
const fs = require("fs");

class LocalTemplateProvider extends TemplateProvider {
  constructor(params, logger) {
    super(params, logger);
  }

  async getThumbnailDataUri(templateId) {
    const thumbnail = fs.readFileSync(
      `./thumbnails/${templateId}.webp`,
      "base64"
    );
    return `data:image/webp;base64,${thumbnail}`;
  }

  async searchAssets(param) {
    const templateDefs = {
      "no-pod": noPodTemplateContent,
      "no-pod-duplicate-fields": noPodDuplicateFieldsTemplateContent,
      "two-pods": twoPodTemplateContent,
      "two-pod-duplicate-fields": twoPodDuplicateFieldsTemplateContent,
    };

    const templates = await Promise.all(
      Object.entries(templateDefs).map(
        async ([templateId, templateContent]) => {
          return {
            id: templateId,
            title: templateId
              .split("-")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" "),
            content: templateContent,
            mapping: COMMON_MAPPING,
            additionalMetadata: {
              thumbnailUrl: await this.getThumbnailDataUri(templateId),
            },
          };
        }
      )
    );

    return {
      statusCode: 200,
      body: {
        templates: templates,
      },
    };
  }
}

module.exports = LocalTemplateProvider;
