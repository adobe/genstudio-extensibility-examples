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

export const actionWebInvoke = async (
  actionUrl: string,
  imsToken: string,
  imsOrg: string,
  params: Record<string, any> = {}
): Promise<any> => {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${imsToken}`,
    "x-gw-ims-org-id": imsOrg,
  };

  const response = await fetch(actionUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};
