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

import { useState, useCallback } from "react";

import { actionWebInvoke } from "../utils/actionWebInvoke";
import { Auth } from "../types";

import actions from "../config.json";
import { AEM_URL } from "../Constants";

export const useFragmentPoller = (
  auth: Auth | null,
  aemHost: string | null
) => {
  const [isPollingFragments, setIsPollingFragments] = useState(false);
  const [fragments, setFragments] = useState<any[]>([]); // TODO: type

  const pollFragments = useCallback(async () => {
    setIsPollingFragments(true);

    const maxRetries = 10;
    const intervalMs = 2_000;
    let retryCount = 0;

    if (!auth?.imsToken || !auth?.imsOrg || !auth.apiKey) return;

    const url = actions[AEM_URL as keyof typeof actions];

    while (retryCount < maxRetries) {
      const response = await actionWebInvoke(url, auth.imsToken, auth.imsOrg, {
        aemHost,
      });

      if (response && typeof response === "object") {
        setFragments((response as { fragments: any[] }).fragments || []);
        setIsPollingFragments(false);
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, intervalMs));
      retryCount++;
    }

    setIsPollingFragments(false);
  }, [auth, aemHost]);

  return { fragments, isPollingFragments, pollFragments };
};
