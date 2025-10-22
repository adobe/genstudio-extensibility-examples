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
  const [baseAssets, setBaseAssets] = useState<Asset[]>([]);
  const [displayedAssets, setDisplayedAssets] = useState<Asset[]>([]);
  const [availableFileTypes, setAvailableFileTypes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extractFileTypes = (assetList: Asset[]): string[] => {
    const fileTypes = assetList
      .map((asset) => (asset.mimeType || "").toUpperCase())
      .filter((type) => type && type !== "UNKNOWN")
      .filter((type, index, array) => array.indexOf(type) === index)
      .sort();

    return fileTypes;
  };

  const updateAvailableFileTypes = (assetList: Asset[]) => {
    const fileTypes = extractFileTypes(assetList);
    setAvailableFileTypes(fileTypes);
  };

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
          setBaseAssets(response.assets);
          setDisplayedAssets(response.assets);

          if (
            response.availableFileTypes &&
            Array.isArray(response.availableFileTypes)
          ) {
            setAvailableFileTypes(response.availableFileTypes);
          } else {
            updateAvailableFileTypes(response.assets);
          }
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

  const applySearchAndFilter = (
    searchTerm: string = "",
    fileTypes: string[] = []
  ) => {
    let filteredAssets = baseAssets;

    if (searchTerm.trim()) {
      filteredAssets = baseAssets.filter((asset) => {
        const name = asset.name || "";
        const assetFileType = asset.mimeType || "";
        const keywords = asset.keywords || [];

        return (
          name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          assetFileType.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (Array.isArray(keywords) &&
            keywords.some(
              (keyword: string) =>
                typeof keyword === "string" &&
                keyword.toLowerCase().includes(searchTerm.toLowerCase())
            ))
        );
      });
    }

    if (fileTypes.length > 0) {
      filteredAssets = filteredAssets.filter((asset) => {
        const assetFileType = (asset.mimeType || "").toUpperCase();
        return fileTypes.some((type) => type.toUpperCase() === assetFileType);
      });
    }

    setDisplayedAssets(filteredAssets);
  };

  const searchAssets = (query: string) => {
    applySearchAndFilter(query, []);
  };

  const filterAssets = (
    fileTypes: string[] = [],
    currentSearchTerm: string = ""
  ) => {
    applySearchAndFilter(currentSearchTerm, fileTypes);
  };

  const resetToBaseAssets = () => {
    setDisplayedAssets(baseAssets);
  };

  return {
    assets: displayedAssets,
    availableFileTypes,
    isLoading,
    error,
    fetchAssets,
    searchAssets,
    filterAssets,
    resetToBaseAssets,
  };
};
