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

class ValidationError extends Error {}

function getMissingKeys(obj, required) {
  return required.filter((r) => {
    const splits = r.split(".");
    const last = splits[splits.length - 1];
    const traverse = splits.slice(0, -1).reduce((tObj, split) => {
      tObj = tObj[split] || {};
      return tObj;
    }, obj);
    return traverse[last] === undefined || traverse[last] === "";
  });
}

function checkMissingRequestInputs(params, requiredParams = [], requiredHeaders = []) {
  let errorMessage = null;
  requiredHeaders = requiredHeaders.map((h) => h.toLowerCase());

  const missingHeaders = getMissingKeys(params.__ow_headers || {}, requiredHeaders);
  if (missingHeaders.length > 0) {
    errorMessage = `missing header(s) '${missingHeaders}'`;
  }

  const missingParams = getMissingKeys(params, requiredParams);
  if (missingParams.length > 0) {
    if (errorMessage) {
      errorMessage += " and ";
    } else {
      errorMessage = "";
    }
    errorMessage += `missing parameter(s) '${missingParams}'`;
  }

  return errorMessage;
}

function errorResponse(statusCode, message, logger) {
  if (logger) {
    logger.error(message);
  } else {
    console.error(message);
  }
  return { error: { statusCode, body: { error: message } } };
}

module.exports = {
  checkMissingRequestInputs,
  errorResponse,
  ValidationError,
};
