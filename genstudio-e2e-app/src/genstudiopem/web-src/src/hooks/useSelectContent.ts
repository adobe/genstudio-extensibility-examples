/*
Copyright 2026 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { useState, useCallback } from "react";
import { Asset } from "@adobe/genstudio-extensibility-sdk";
import { Auth } from "../types";
import config from "../config.json";
import { actionWebInvoke } from "../utils/actionWebInvoke";
import { LIST_ASSETS_ACTION } from "../Constants";

export const useSelectContent = (auth: Auth | null) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAssets = useCallback(async () => {
    if (!auth) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await actionWebInvoke(
        config[LIST_ASSETS_ACTION],
        auth.imsToken,
        auth.imsOrg
      );
      setAssets(response.assets || response.body?.assets || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  }, [auth]);

  return { assets, isLoading, error, fetchAssets };
};
