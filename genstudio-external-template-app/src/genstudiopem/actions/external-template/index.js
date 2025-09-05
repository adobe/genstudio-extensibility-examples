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
const { errorResponse, ValidationError } = require("../utils");
const S3TemplateProvider = require("./provider/s3/S3TemplateProvider");

exports.main = async (params) => {
  const logger = Core.Logger("main", { level: params.LOG_LEVEL || "info" });
  const actionType = params.actionType || "search";
  const templateProvider = new S3TemplateProvider(params, logger);
  
  try {
    //TODO: Add other actions like selections or search here
    switch (actionType) {
      case "getTemplates":
        return await templateProvider.searchAssets(params);
      default:
        return errorResponse(
          400,
          `Unsupported action type: ${actionType}`,
          logger
        );
    }
  } catch (err) {
    if (err instanceof ValidationError) {
      // parameter validation failed
      return errorResponse(400, err.message, logger);
    }
    logger.error(err);
    return errorResponse(500, "Internal server error: " + err.message, logger);
  }
};
