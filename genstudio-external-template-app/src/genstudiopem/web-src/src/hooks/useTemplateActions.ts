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
import { LOAD_TEMPLATE_ACTION } from "../Constants";

interface Auth {
  imsToken: string;
  imsOrg: string;
}

// Define constants for our action endpoints


export const useTemplateActions = (auth: Auth | null) => {
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

  // Generate a unique client-side id (for UI keys/selection)
  const generateUniqueId = (prefix: string = "asset"): string => {
    try {
      if (typeof crypto !== "undefined" && (crypto as any).randomUUID) {
        return `${prefix}-${(crypto as any).randomUUID()}`;
      }
    } catch {}
    const time = Date.now().toString(36);
    const rnd = Math.random().toString(36).slice(2);
    return `${prefix}-${time}-${rnd}`;
  };

  // Static mock S3 response provided for local testing
  const STATIC_S3_RESPONSE = {
    assets: [
      {
        dateCreated: "2025-08-19T22:55:20.000Z",
        dateModified: "2025-08-19T22:55:20.000Z",
        fileType: "HTML",
        id: "templates/html/email sub-headline template.html",
        metadata: {
          contentType: "text/html",
          size: 49485
        },
        name: "email sub-headline template.html",
        size: 49485,
        thumbnailUrl: "https://genstudio-uix-external-dam-demo.s3.us-east-1.amazonaws.com/thumbnails/templates/html/email%20sub-headline%20template.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAU6GD2JLYS2TWIMO7%2F20250829%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250829T215709Z&X-Amz-Expires=3600&X-Amz-Signature=6017ac0ffff6e8960fc0705c299a09bd608e8a0ded73c8d5d77ef82324a725b1&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject",
        url: "https://genstudio-uix-external-dam-demo.s3.us-east-1.amazonaws.com/templates/html/email%20sub-headline%20template.html?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAU6GD2JLYS2TWIMO7%2F20250829%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250829T215709Z&X-Amz-Expires=3600&X-Amz-Signature=4e765e56347837276d2a8522f7c92ece93afb8598318b221a8e8c2a487d08392&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject"
      },
      {
        dateCreated: "2025-08-19T22:55:20.000Z",
        dateModified: "2025-08-19T22:55:20.000Z",
        fileType: "HTML",
        id: "templates/html/email template multi-field role.html",
        metadata: {
          contentType: "text/html",
          size: 49485
        },
        name: "email template multi-field role.html",
        size: 49485,
        thumbnailUrl: "https://genstudio-uix-external-dam-demo.s3.us-east-1.amazonaws.com/thumbnails/templates/html/email%20template%20multi-field%20role.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAU6GD2JLYS2TWIMO7%2F20250829%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250829T215709Z&X-Amz-Expires=3600&X-Amz-Signature=cb1042f6bd73fe9ae5f39b164dee509cf6f128817df4c91f7b683c25d35371de&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject",
        url: "https://genstudio-uix-external-dam-demo.s3.us-east-1.amazonaws.com/templates/html/email%20template%20multi-field%20role.html?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAU6GD2JLYS2TWIMO7%2F20250829%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250829T215709Z&X-Amz-Expires=3600&X-Amz-Signature=2db76d29cfb58bf5ef2d80996722e4e38d818a848e576b359498b4091fecfb7a&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject"
      },
      {
        dateCreated: "2025-08-19T22:55:19.000Z",
        dateModified: "2025-08-19T22:55:19.000Z",
        fileType: "HTML",
        id: "templates/html/email template two pod.html",
        metadata: {
          contentType: "text/html",
          size: 34756
        },
        name: "email template two pod.html",
        size: 34756,
        thumbnailUrl: "https://genstudio-uix-external-dam-demo.s3.us-east-1.amazonaws.com/thumbnails/templates/html/email%20template%20two%20pod.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAU6GD2JLYS2TWIMO7%2F20250829%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250829T215709Z&X-Amz-Expires=3600&X-Amz-Signature=0dd72279e2bb150db34d712e5e3ff595fa8dcd8f70f275a921f201ebd8b5c9ba&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject",
        url: "https://genstudio-uix-external-dam-demo.s3.us-east-1.amazonaws.com/templates/html/email%20template%20two%20pod.html?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAU6GD2JLYS2TWIMO7%2F20250829%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250829T215709Z&X-Amz-Expires=3600&X-Amz-Signature=d95cd94ffacb5c521a224d5dbae81faebb0daddaa2c56856d624629dc8a20d56&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject"
      },
      {
        dateCreated: "2025-08-19T22:55:19.000Z",
        dateModified: "2025-08-19T22:55:19.000Z",
        fileType: "HTML",
        id: "templates/html/email template w_ linked image.html",
        metadata: {
          contentType: "text/html",
          size: 2744210
        },
        name: "email template w_ linked image.html",
        size: 2744210,
        thumbnailUrl: "https://genstudio-uix-external-dam-demo.s3.us-east-1.amazonaws.com/thumbnails/templates/html/email%20template%20w_%20linked%20image.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAU6GD2JLYS2TWIMO7%2F20250829%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250829T215709Z&X-Amz-Expires=3600&X-Amz-Signature=033d5e3bccfc60d2e1519e8939469a99bcf5f95b28c9362d7d9fec4a84c7e498&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject",
        url: "https://genstudio-uix-external-dam-demo.s3.us-east-1.amazonaws.com/templates/html/email%20template%20w_%20linked%20image.html?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAU6GD2JLYS2TWIMO7%2F20250829%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250829T215709Z&X-Amz-Expires=3600&X-Amz-Signature=6761e5ca8c4c2e0ba8d84ddd1bf957e155ebcef54f8d17df7ca7cd36149113e9&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject"
      },
      {
        dateCreated: "2025-08-21T00:20:13.000Z",
        dateModified: "2025-08-21T00:20:13.000Z",
        fileType: "HTML",
        id: "templates/html/email_multi_sections.html",
        metadata: {
          contentType: "text/html",
          size: 1828
        },
        name: "email_multi_sections.html",
        size: 1828,
        thumbnailUrl: "https://genstudio-uix-external-dam-demo.s3.us-east-1.amazonaws.com/thumbnails/templates/html/email_multi_sections.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAU6GD2JLYS2TWIMO7%2F20250829%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250829T215709Z&X-Amz-Expires=3600&X-Amz-Signature=f7a495d0542608534f80715ba46251f0c545b758e4a31cb8f06cfca93e89248d&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject",
        url: "https://genstudio-uix-external-dam-demo.s3.us-east-1.amazonaws.com/templates/html/email_multi_sections.html?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAU6GD2JLYS2TWIMO7%2F20250829%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250829T215709Z&X-Amz-Expires=3600&X-Amz-Signature=b7421073120532188965443d256d1ca0494a2be8683d874da6614c39d3c1c915&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject"
      },
      {
        dateCreated: "2025-08-21T00:20:13.000Z",
        dateModified: "2025-08-21T00:20:13.000Z",
        fileType: "HTML",
        id: "templates/html/email_single_section.html",
        metadata: {
          contentType: "text/html",
          size: 1171
        },
        name: "email_single_section.html",
        size: 1171,
        thumbnailUrl: "https://genstudio-uix-external-dam-demo.s3.us-east-1.amazonaws.com/thumbnails/templates/html/email_single_section.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAU6GD2JLYS2TWIMO7%2F20250829%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250829T215709Z&X-Amz-Expires=3600&X-Amz-Signature=9287a9785c606a4669a22e055ad992804daa9c429d60837dc840b6c39a143095&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject",
        url: "https://genstudio-uix-external-dam-demo.s3.us-east-1.amazonaws.com/templates/html/email_single_section.html?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAU6GD2JLYS2TWIMO7%2F20250829%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250829T215709Z&X-Amz-Expires=3600&X-Amz-Signature=2c0849244f29ea4a6a215385c11d0a5119b77e46c3c1d8f60a1faf85a9249ab3&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject"
      }
    ],
    availableFileTypes: ["HTML"]
  } as const;

  // Thumbnails present under mock-templates/thumbnails (exact filenames match asset.name with .webp)
  const LOCAL_THUMBNAILS_BY_NAME: Record<string, string> = {
    "email sub-headline template.html": new URL("../mock-templates/thumbnails/email sub-headline template.webp", import.meta.url).toString(),
    "email template multi-field role.html": new URL("../mock-templates/thumbnails/email template multi-field role.webp", import.meta.url).toString(),
    "email template two pod.html": new URL("../mock-templates/thumbnails/email template two pod.webp", import.meta.url).toString(),
    "email template w_ linked image.html": new URL("../mock-templates/thumbnails/email template w_ linked image.webp", import.meta.url).toString(),
  };

  // Build multiple mock assets using URL(import.meta.url) per file (no HTML fetch)
  const getMockAssetsFromFolder = async (): Promise<DamAsset[]> => {
    const now = Date.now();
    const assets: DamAsset[] = Object.entries(LOCAL_THUMBNAILS_BY_NAME).map(([name, thumbUrl], index) => ({
      templateId: generateUniqueId('template'),
      id: `local-${now}-${index}`,
      name,
      fileType: "HTML",
      thumbnailUrl: thumbUrl,
      url: "",
      metadata: { keywords: ["html", "mock", "local"] },
      dateCreated: new Date(now).toISOString(),
      dateModified: new Date(now).toISOString(),
    }));
    return assets;
  };

  const fetchTemplates = useCallback(async (
    params: AssetSearchParams = { limit: 100, offset: 0 }
  ) => {
    setIsLoading(true);
    setError(null);
  
  try {
    if(!auth){
      // Use provided static S3-shaped response to exercise the normal response path
      const mockResponse = STATIC_S3_RESPONSE;
      if (mockResponse && Array.isArray(mockResponse.assets)) {
        const validatedAssets = (mockResponse.assets as any[]).map(asset => {
          const name = asset.name || 'Unknown';
          const localThumb = LOCAL_THUMBNAILS_BY_NAME[name];
          const randomThumb = (() => {
            const thumbs = Object.values(LOCAL_THUMBNAILS_BY_NAME);
            return thumbs.length ? thumbs[Math.floor(Math.random() * thumbs.length)] : undefined;
          })();
          return {
            templateId: generateUniqueId('template'),
            id: asset.id || '',
            name,
            fileType: asset.fileType || 'UNKNOWN',
            thumbnailUrl: localThumb || randomThumb || asset.thumbnailUrl || asset.url || '',
            url: asset.url || '',
            metadata: asset.metadata || {},
            dateCreated: asset.dateCreated || new Date().toISOString(),
            dateModified: asset.dateModified || new Date().toISOString(),
          };
        });
        setBaseAssets(validatedAssets);
        setDisplayedAssets(validatedAssets);
        if (mockResponse.availableFileTypes && Array.isArray(mockResponse.availableFileTypes)) {
          setAvailableFileTypes(mockResponse.availableFileTypes);
        } else {
          updateAvailableFileTypes(validatedAssets);
        }
        return;
      }
      // Fallback to simple local mocks
      const folderAssets = await getMockAssetsFromFolder();
      const mockAssets = (folderAssets && folderAssets.length > 0) ? folderAssets : getMockAssets();
      setBaseAssets(mockAssets);
      setDisplayedAssets(mockAssets);
      updateAvailableFileTypes(mockAssets);
      return;
    }
    const url = actions[LOAD_TEMPLATE_ACTION];
    const response = await actionWebInvoke(
      url,
      auth?.imsToken,
      auth?.imsOrg,
      params
    );
    
    if (response && typeof response === "object" && "assets" in response) {
      const validatedAssets = (response.assets as any[]).map(asset => {
        const name = asset.name || 'Unknown';
        const localThumb = LOCAL_THUMBNAILS_BY_NAME[name];
        const randomThumb = (() => {
          const thumbs = Object.values(LOCAL_THUMBNAILS_BY_NAME);
          return thumbs.length ? thumbs[Math.floor(Math.random() * thumbs.length)] : undefined;
        })();
        return {
          templateId: generateUniqueId('template'),
          id: asset.id || '',
          name,
          fileType: asset.fileType || 'UNKNOWN',
          thumbnailUrl: localThumb || randomThumb || asset.thumbnailUrl || asset.url || '',
          url: asset.url || '',
          metadata: asset.metadata || {},
          dateCreated: asset.dateCreated || new Date().toISOString(),
          dateModified: asset.dateModified || new Date().toISOString(),
        };
      });
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
  fetchTemplates,
  searchAssets,
  filterAssets,
  resetToBaseAssets,
  addLocalHtmlAsset,
};
};
