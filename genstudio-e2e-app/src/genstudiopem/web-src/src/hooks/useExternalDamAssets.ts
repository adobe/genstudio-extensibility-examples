import { useState, useCallback } from "react";
import { Asset } from "@adobe/genstudio-extensibility-sdk";
import { Auth } from "../types";
import config from "../config.json";
import { actionWebInvoke } from "../utils/actionWebInvoke";

const LIST_ASSETS_ACTION = "genstudio-e2e-app/list";

export const useExternalDamAssets = (auth: Auth | null) => {
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
