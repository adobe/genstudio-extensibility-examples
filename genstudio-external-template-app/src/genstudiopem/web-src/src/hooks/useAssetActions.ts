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
import { AssetSearchParams, DamAsset } from "../types";
import { actionWebInvoke } from "../utils/actionWebInvoke";
import actions from "../config.json";

interface Auth {
  imsToken: string;
  imsOrg: string;
}

// Define constants for our action endpoints
const SEARCH_ASSETS_ACTION = "genstudio-external-template-app/get-templates";


export const useAssetActions = (auth: Auth) => {
  const [baseAssets, setBaseAssets] = useState<DamAsset[]>([]);
  const [displayedAssets, setDisplayedAssets] = useState<DamAsset[]>([]);
  const [availableFileTypes, setAvailableFileTypes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const placeholderThumb = "https://via.placeholder.com/160x120?text=HTML";

  const extractFileTypes = (assetList: DamAsset[]): string[] => {
    const fileTypes = assetList
      .map(asset => (asset.fileType || '').toUpperCase())
      .filter(type => type && type !== 'UNKNOWN')
      .filter((type, index, array) => array.indexOf(type) === index)
      .sort();

    return fileTypes;
  };

  const updateAvailableFileTypes = (assetList: DamAsset[]) => {
    const fileTypes = extractFileTypes(assetList);
    setAvailableFileTypes(fileTypes);
  };

  const fetchAssets = useCallback(async (
    params: AssetSearchParams = { limit: 100, offset: 0 }
  ) => {
    setIsLoading(true);
    setError(null);
  
  try {
    debugger;
    console.log("Loaded Fetch Assets.....");
    const url = actions[SEARCH_ASSETS_ACTION];
    const response = await actionWebInvoke(
      url,
      auth?.imsToken,
      auth?.imsOrg,
      params
    );
    
    // const response = await actionWebInvoke(
    //   url,
    //   imsToken,
    //   imsOrg,
    //   params
    // );
    if (response && typeof response === "object" && "assets" in response) {
      const validatedAssets = (response.assets as any[]).map(asset => ({
        id: asset.id || '',
        name: asset.name || 'Unknown',
        fileType: asset.fileType || 'UNKNOWN',
        thumbnailUrl: asset.thumbnailUrl || asset.url || '',
        url: asset.url || '',
        metadata: asset.metadata || {},
        dateCreated: asset.dateCreated || new Date().toISOString(),
        dateModified: asset.dateModified || new Date().toISOString(),
      }));
      if (Array.isArray(validatedAssets) && validatedAssets.length > 0) {
        setBaseAssets(validatedAssets);
        setDisplayedAssets(validatedAssets);
        if (response.availableFileTypes && Array.isArray(response.availableFileTypes)) {
          setAvailableFileTypes(response.availableFileTypes);
        } else {
          updateAvailableFileTypes(validatedAssets);
        }
      } else {
        // Fallback to mock assets when API returns empty
        const mockAssets = getMockAssets();
        setBaseAssets(mockAssets);
        setDisplayedAssets(mockAssets);
        updateAvailableFileTypes(mockAssets);
      }
    } else {
      debugger;
      const mockAssets = getMockAssets();
      setBaseAssets(mockAssets);
      setDisplayedAssets(mockAssets);
      updateAvailableFileTypes(mockAssets);
    }
  } catch (err) {
    console.warn("Error fetching assets:", err);
    setError("Failed to fetch assets. Please try again.");
    const mockAssets = getMockAssets();
    setBaseAssets(mockAssets);
    setDisplayedAssets(mockAssets);
    updateAvailableFileTypes(mockAssets);
  } finally {
    setIsLoading(false);
  }
}, [auth]);

const applySearchAndFilter = (searchTerm: string = "", fileTypes: string[] = []) => {
  let filteredAssets = baseAssets;

  if (searchTerm.trim()) {
    filteredAssets = baseAssets.filter((asset) => {
      const name = asset.name || '';
      const assetFileType = asset.fileType || '';
      const keywords = asset.metadata?.keywords || [];

      return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assetFileType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (Array.isArray(keywords) &&
          keywords.some((keyword: string) =>
            typeof keyword === 'string' && keyword.toLowerCase().includes(searchTerm.toLowerCase())
          ));
    });
  }

  if (fileTypes.length > 0) {
    filteredAssets = filteredAssets.filter((asset) => {
      const assetFileType = (asset.fileType || '').toUpperCase();
      return fileTypes.some(type => type.toUpperCase() === assetFileType);
    });
  }

  setDisplayedAssets(filteredAssets);
};

const searchAssets = (query: string) => {
  applySearchAndFilter(query, []);
};

const filterAssets = (fileTypes: string[] = [], currentSearchTerm: string = "") => {
  applySearchAndFilter(currentSearchTerm, fileTypes);
};

const resetToBaseAssets = () => {
  setDisplayedAssets(baseAssets);
};

// Add a local HTML file as an in-app asset
const addLocalHtmlAsset = async (file: File) => {
  const text = await file.text();
  const dataUrl = "data:text/html;charset=utf-8," + encodeURIComponent(text);
  const asset: DamAsset = {
    id: "local-" + Date.now(),
    name: file.name || "sample.html",
    fileType: "HTML",
    thumbnailUrl: placeholderThumb,
    url: dataUrl,
    metadata: { size: file.size, keywords: ["html", "local", "upload"] },
    dateCreated: new Date().toISOString(),
    dateModified: new Date().toISOString(),
  };
  const next = [asset, ...baseAssets];
  setBaseAssets(next);
  setDisplayedAssets([asset, ...displayedAssets]);
  updateAvailableFileTypes(next);
};

// Get a presigned URL for an asset
const getAssetPresignedUrl = async (
  assetId: string
): Promise<string | null> => {
  try {
    if (!auth) {
      throw new Error("Authentication not found");
    }
    const response = await actionWebInvoke(
      actions[GET_ASSET_URL_ACTION],
      auth.imsToken,
      auth.imsOrg,
      { assetId }
    );

    if (response && typeof response === "object" && "url" in response) {
      return response.url as string;
    }
    return null;
  } catch (err) {
    console.error("Error getting asset URL:", err);
    setError("Failed to get asset URL. Please try again.");
    return null;
  }
};

// Get asset metadata
const getAssetMetadata = async (assetId: string) => {
  try {
    if (!auth) {
      throw new Error("Authentication not found");
    }
    const response = await actionWebInvoke(
      actions[GET_ASSET_METADATA_ACTION],
      auth.imsToken,
      auth.imsOrg,
      { assetId }
    );

    if (response && typeof response === "object" && "metadata" in response) {
      return response.metadata;
    }
    return null;
  } catch (err) {
    console.error("Error getting asset metadata:", err);
    setError("Failed to get asset metadata. Please try again.");
    return null;
  }
};

// Helper function to generate mock assets for development
const getMockAssets = (): DamAsset[] => {
  const placeholderThumb = "https://via.placeholder.com/160x120?text=HTML";

  const makeHtmlDataUrl = (title: string, body: string) => {
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title></head><body><h1 style="font-family:Arial,sans-serif">${title}</h1><p style="font-family:Arial,sans-serif">${body}</p></body></html>`;
    return `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
  };

  const names = [
    "sample-landing.html",
    "offer-page.html",
    "email-template.html",
    "promo-banner.html",
    "legal-copy.html"
  ];

  const mockAssets: DamAsset[] = names.map((name, index) => ({
    id: `asset-${index + 1}`,
    name,
    fileType: "HTML",
    thumbnailUrl: placeholderThumb,
    url: makeHtmlDataUrl(name, "This is a mock HTML asset used for development."),
    metadata: {
      keywords: ["html", "mock", "template", "demo"],
    },
    dateCreated: new Date().toISOString(),
    dateModified: new Date().toISOString(),
  }));

  return mockAssets;
};

return {
  assets: displayedAssets,
  availableFileTypes,
  isLoading,
  error,
  fetchAssets,
  searchAssets,
  filterAssets,
  getAssetPresignedUrl,
  getAssetMetadata,
  resetToBaseAssets,
  addLocalHtmlAsset,
};
};
