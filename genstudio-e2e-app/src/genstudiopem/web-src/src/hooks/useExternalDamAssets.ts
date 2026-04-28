import { useState, useCallback, useMemo } from "react";
import { Asset } from "@adobe/genstudio-extensibility-sdk";
import { Auth } from "../types";
import config from "../config.json";

const MOCK_ASSETS: Asset[] = [
  {
    id: "asset-1",
    name: "Sample Asset 1",
    externalAssetInfo: {
      sourceUrl: "https://via.placeholder.com/800x600?text=Asset+1",
      signedUrl: "https://via.placeholder.com/800x600?text=Asset+1",
      signedThumbnailUrl: "https://via.placeholder.com/200x200?text=A1",
    },
    mimeType: "image/jpeg",
    size: 1024000,
    extensionInfo: { id: "e2e-app", name: "E2E Test App" },
  },
  {
    id: "asset-2",
    name: "Sample Asset 2",
    externalAssetInfo: {
      sourceUrl: "https://via.placeholder.com/800x600?text=Asset+2",
      signedUrl: "https://via.placeholder.com/800x600?text=Asset+2",
      signedThumbnailUrl: "https://via.placeholder.com/200x200?text=A2",
    },
    mimeType: "image/jpeg",
    size: 856000,
    extensionInfo: { id: "e2e-app", name: "E2E Test App" },
  },
];

export const useExternalDamAssets = (auth: Auth | null) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchUrl = useMemo(() => {
    return (config as any).search;
  }, []);

  const fetchAssets = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Use mock data for now due to Adobe deploy service issues
      if ((config as any).useMockData || !searchUrl) {
        setTimeout(() => {
          setAssets(MOCK_ASSETS);
          setIsLoading(false);
        }, 500);
        return;
      }

      if (!auth) {
        setError("Waiting for authentication...");
        setIsLoading(false);
        return;
      }

      const response = await fetch(searchUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${auth.imsToken}`,
          "x-gw-ims-org-id": auth.imsOrg,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch assets: ${response.status}`);
      }

      const data = await response.json();
      setAssets(data.assets || data.body?.assets || []);
    } catch (err) {
      console.error("Error fetching assets:", err);
      setError(`Failed to fetch assets: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  }, [auth, searchUrl]);

  return { assets, isLoading, error, fetchAssets };
};
