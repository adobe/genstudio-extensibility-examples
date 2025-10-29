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
import { AssetSearchParams } from "../types";
import { actionWebInvoke } from "../utils/actionWebInvoke";
import actions from "../config.json";
import { Asset } from "@adobe/genstudio-extensibility-sdk";

interface Auth {
  imsToken: string;
  imsOrg: string;
}

// Define constants for our action endpoints
const SEARCH_ASSETS_ACTION = "genstudio-external-dam-app/search";

export const useAssetActions = (auth: Auth) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAssets = useCallback(
    async (params: AssetSearchParams = { limit: 100, offset: 0 }) => {
      setIsLoading(true);
      setError(null);

      if (!auth) {
        setError("Authentication required to fetch assets");
        setIsLoading(false);
        return;
      }

      try {
        const url = actions[SEARCH_ASSETS_ACTION];
        const response = await actionWebInvoke(
          url,
          auth.imsToken,
          auth.imsOrg,
          params
        );

        if (response && typeof response === "object" && "assets" in response) {
          setAssets(response.assets);
        } else {
          setError("Invalid response format from asset search");
        }
      } catch (err) {
        console.error("Error fetching assets:", err);
        setError("Failed to fetch assets. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [auth]
  );

  return {
    assets,
    isLoading,
    error,
    fetchAssets,
  };
};
