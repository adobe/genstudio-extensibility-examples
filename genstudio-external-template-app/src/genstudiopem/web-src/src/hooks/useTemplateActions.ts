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
import { DamAsset, AssetSearchParams } from "../types";
import actions from "../config.json";
import { actionWebInvoke } from "../utils/actionWebInvoke";

interface Auth {
  imsToken: string;
  imsOrg: string;
}

const SEARCH_TEMPLATES_ACTION = "genstudio-external-dam-app/search";

export const useTemplateActions = (auth: Auth | null) => {
  const [templates, setTemplates] = useState<DamAsset[]>([]);
  const [availableFileTypes, setAvailableFileTypes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extractFileTypes = (assetList: DamAsset[]): string[] => {
    return Array.from(
      new Set(
        assetList
          .map((a) => (a.fileType || "").toUpperCase())
          .filter((t) => t && t !== "UNKNOWN")
      )
    ).sort();
  };

  const fetchTemplates = useCallback(
    async (params: AssetSearchParams = { limit: 100, offset: 0 }) => {
      setIsLoading(true);
      setError(null);

      try {
        const url = (actions as any)[SEARCH_TEMPLATES_ACTION];
        const response = await actionWebInvoke(
          url,
          auth?.imsToken,
          auth?.imsOrg,
          params
        );

        if (response && typeof response === "object" && "assets" in response) {
          const all = (response.assets as any[]).map((asset) => ({
            id: asset.id || "",
            name: asset.name || "Unknown",
            fileType: asset.fileType || "UNKNOWN",
            thumbnailUrl: asset.thumbnailUrl || asset.url || "",
            url: asset.url || "",
            metadata: asset.metadata || {},
            dateCreated: asset.dateCreated || new Date().toISOString(),
            dateModified: asset.dateModified || new Date().toISOString(),
          })) as DamAsset[];

          // Keep only HTML templates
          const htmlOnly = all.filter(
            (a) => (a.fileType || "").toUpperCase() === "HTML"
          );

          const list = htmlOnly.length ? htmlOnly : all;
          setTemplates(list);
          setAvailableFileTypes(extractFileTypes(list));
        } else {
          setTemplates([]);
          setAvailableFileTypes([]);
        }
      } catch (e: any) {
        setError("Failed to fetch templates");
        setTemplates([]);
        setAvailableFileTypes([]);
      } finally {
        setIsLoading(false);
      }
    },
    [auth]
  );

  return {
    templates,
    availableFileTypes,
    isLoading,
    error,
    fetchTemplates,
  };
};


