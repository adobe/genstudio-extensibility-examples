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
import { Heading } from "@react-spectrum/s2";
import { Selection } from "@react-types/shared";
import {
  SelectContentExtensionService,
  Asset,
} from "@adobe/genstudio-extensibility-sdk";
import { useGuestConnection, useExternalDamAssets, useAuth } from "../../hooks";
import { EXTENSION_ID, EXTENSION_LABEL, ICON_DATA_URI } from "../../Constants";

export default function AssetViewer(): React.JSX.Element {
  const [selectedAssetIds, setSelectedAssets] = useState<Selection>(new Set());
  const guestConnection = useGuestConnection(EXTENSION_ID);
  const auth = useAuth(guestConnection);
  const { assets, isLoading, error, fetchAssets } = useExternalDamAssets(auth);

  // Fetch assets on component mount
  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const handleAssetSelect = (assetId: string) => {
    const newSelection = new Set(selectedAssetIds instanceof Set ? selectedAssetIds : []);
    if (newSelection.has(assetId)) {
      newSelection.delete(assetId);
    } else {
      newSelection.add(assetId);
    }
    setSelectedAssets(newSelection);

    // Update host with selected assets
    if (guestConnection && newSelection.size > 0) {
      const selectedIds = Array.from(newSelection);
      const assetsToSend = assets.filter((asset) =>
        selectedIds.includes(asset.id)
      ).map((asset) => ({
        ...asset,
        extensionInfo: {
          id: EXTENSION_ID,
          name: EXTENSION_LABEL,
          iconUrl: ICON_DATA_URI,
        },
      }));
      try {
        SelectContentExtensionService.setSelectedAssets(
          guestConnection,
          EXTENSION_ID,
          assetsToSend
        );
      } catch (error) {
        console.warn("Error updating host:", error);
      }
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <Heading level={2}>Select Assets from S3</Heading>

      <div style={{ marginTop: "20px" }}>
        {isLoading && (
          <div style={{ color: "#666", fontStyle: "italic" }}>Loading assets...</div>
        )}

        {error && (
          <div style={{ color: "#d32f2f", padding: "12px", backgroundColor: "#ffebee", borderRadius: "4px" }}>
            Error: {error}
          </div>
        )}

        {!isLoading && !error && assets.length === 0 && (
          <div style={{ color: "#666", fontStyle: "italic" }}>No assets found</div>
        )}

        {!isLoading && assets.map((asset) => {
          const isSelected = selectedAssetIds instanceof Set && selectedAssetIds.has(asset.id);
          return (
            <div
              key={asset.id}
              onClick={() => handleAssetSelect(asset.id)}
              style={{
                padding: "12px",
                marginBottom: "8px",
                border: isSelected ? "2px solid #0078d4" : "1px solid #ccc",
                backgroundColor: isSelected ? "#e7f3ff" : "#fff",
                cursor: "pointer",
                borderRadius: "4px",
              }}
            >
              <div style={{ fontWeight: "bold" }}>{asset.name}</div>
              <div style={{ fontSize: "12px", color: "#666" }}>
                {asset.mimeType} • {(asset.size / 1024).toFixed(0)} KB
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
