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

import React, { useState, useEffect } from "react";
import {
  SelectContentExtensionService,
  Asset,
} from "@adobe/genstudio-extensibility-sdk";
import { useGuestConnection, useExternalDamAssets, useAuth } from "../../hooks";
import { EXTENSION_ID, EXTENSION_LABEL, ICON_DATA_URI } from "../../Constants";

export default function AssetViewer(): React.JSX.Element {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const guestConnection = useGuestConnection(EXTENSION_ID);
  const auth = useAuth(guestConnection);
  const { assets, isLoading, error, fetchAssets } = useExternalDamAssets(auth);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const toggleAsset = (asset: Asset) => {
    const next = new Set(selectedIds);
    if (next.has(asset.id)) {
      next.delete(asset.id);
    } else {
      next.add(asset.id);
    }
    setSelectedIds(next);

    if (guestConnection) {
      const selected = assets
        .filter((a) => next.has(a.id))
        .map((a) => ({
          ...a,
          extensionInfo: {
            id: EXTENSION_ID,
            name: EXTENSION_LABEL,
            iconUrl: ICON_DATA_URI,
          },
        }));
      SelectContentExtensionService.setSelectedAssets(
        guestConnection,
        EXTENSION_ID,
        selected
      );
    }
  };

  if (isLoading) return <div style={{ padding: 20 }}>Loading...</div>;
  if (error) return <div style={{ padding: 20, color: "red" }}>{error}</div>;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
        gap: 12,
        padding: 20,
      }}
    >
      {assets.map((asset) => {
        const selected = selectedIds.has(asset.id);
        return (
          <div
            key={asset.id}
            onClick={() => toggleAsset(asset)}
            style={{
              border: selected ? "2px solid #0078d4" : "1px solid #ddd",
              borderRadius: 6,
              cursor: "pointer",
              overflow: "hidden",
              background: selected ? "#e7f3ff" : "#fff",
            }}
          >
            <img
              src={asset.externalAssetInfo?.signedThumbnailUrl}
              alt={asset.name}
              style={{ width: "100%", height: 120, objectFit: "cover" }}
            />
            <div style={{ padding: "6px 8px", fontSize: 12 }}>{asset.name}</div>
          </div>
        );
      })}
    </div>
  );
}
