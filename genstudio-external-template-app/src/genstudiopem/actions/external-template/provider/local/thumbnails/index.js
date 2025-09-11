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

const fs = require("fs");

// This is a function that list all the files in the thumbnails directory
// and create a js file that exports an object with the file name as the key and the file content as the value in base64
async function main() {
  const thumbnails = {};
  fs.readdir(process.cwd(), (err, files) => {
    files.forEach((file) => {
      // will also include directory names
      if (file.endsWith(".webp")) {
        const content = fs.readFileSync(`./${file}`, "base64");
        thumbnails[file.split(".")[0]] = `data:image/webp;base64,${content}`;
      }
    });
    const jsFile = `module.exports = ${JSON.stringify(thumbnails)}`;
    const jsFilePath = `thumbnails.js`;
    fs.writeFileSync(jsFilePath, jsFile);
  });
}

main();
