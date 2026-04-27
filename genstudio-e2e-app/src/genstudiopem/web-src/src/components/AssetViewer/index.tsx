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

import React, { useEffect, useState } from "react";
import { Heading, SearchField, ProgressCircle } from "@react-spectrum/s2";
import { Selection } from "@react-types/shared";
import {
  SelectContentExtensionService,
  Asset,
} from "@adobe/genstudio-extensibility-sdk";
import { useGuestConnection, useAuth } from "../../hooks";
import { EXTENSION_ID, EXTENSION_LABEL, ICON_DATA_URI } from "../../Constants";

// SVG placeholder data URIs for e2e testing
const placeholderSvg = (text: string) =>
  `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect fill='%23e0e0e0' width='200' height='200'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='14' fill='%23666'%3E${text}%3C/text%3E%3C/svg%3E`;

// Mock assets for e2e testing - using SVG data URIs (allowed by CSP)
const MOCK_ASSETS: Asset[] = [
  {
    id: "e2e-asset-1",
    name: "E2E Asset 1 - Hero Image",
    externalAssetInfo: {
      signedUrl: placeholderSvg("Hero%20Image"),
      signedThumbnailUrl: placeholderSvg("Hero"),
    },
    mimeType: "image/jpeg",
  },
  {
    id: "e2e-asset-2",
    name: "E2E Asset 2 - Product Photo",
    externalAssetInfo: {
      signedUrl: placeholderSvg("Product%20Photo"),
      signedThumbnailUrl: placeholderSvg("Product"),
    },
    mimeType: "image/jpeg",
  },
  {
    id: "e2e-asset-3",
    name: "E2E Asset 3 - Banner",
    externalAssetInfo: {
      signedUrl: placeholderSvg("Banner"),
      signedThumbnailUrl: placeholderSvg("Banner"),
    },
    mimeType: "image/jpeg",
  },
  {
    id: "e2e-asset-4",
    name: "E2E Asset 4 - Thumbnail",
    externalAssetInfo: {
      signedUrl: placeholderSvg("Thumbnail"),
      signedThumbnailUrl: placeholderSvg("Thumb"),
    },
    mimeType: "image/jpeg",
  },
];

export default function AssetViewer(): React.JSX.Element {
  const [selectedAssetIds, setSelectedAssets] = useState<Selection>(new Set());
  const [isMaxSelection, setIsMaxSelection] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [allowedFileTypes, setAllowedFileTypes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const guestConnection = useGuestConnection(EXTENSION_ID);
  const auth = useAuth(guestConnection);

  // Sync with host and establish initial state
  useEffect(() => {
    if (!guestConnection) return;
    syncHostAssets();
  }, [guestConnection]);

  const syncHostAssets = async () => {
    if (!guestConnection) return;
    try {
      const { selectedAssets, allowedFileTypes } =
        await SelectContentExtensionService.sync(guestConnection, EXTENSION_ID);

      if (selectedAssets) {
        setSelectedAssets(
          new Set(
            selectedAssets
              .filter((asset) => asset.extensionInfo.id === EXTENSION_ID)
              .map((asset) => asset.id)
          )
        );
      }
      if (allowedFileTypes) setAllowedFileTypes(allowedFileTypes);
    } catch (error) {
      console.warn("Error syncing with host:", error);
    }
  };

  const handleSelectionChange = async (selection: Selection) => {
    if (!guestConnection) return;

    try {
      const { selectionLimit } = await SelectContentExtensionService.sync(
        guestConnection,
        EXTENSION_ID
      );

      const selectedAssetIdsList = Array.from(selection);

      // Show all other assets as disabled if max selection is reached
      setIsMaxSelection(selectedAssetIdsList.length >= selectionLimit);

      if (selectedAssetIdsList.length > selectionLimit) return;

      const selectedAssets = MOCK_ASSETS.filter((asset) =>
        selectedAssetIdsList.includes(asset.id)
      );

      const newSelectedAssets = selectedAssets.map((asset) => ({
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
          newSelectedAssets
        );

        syncHostAssets();
      } catch (importError) {
        // For e2e test mock assets, import may fail - just update local selection
        console.warn("Asset import skipped for mock assets:", importError);
        setSelectedAssets(selection);
      }
    } catch (error) {
      console.warn("Error in asset selection:", error);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const getFilteredAssets = () => {
    if (!allowedFileTypes.length) return MOCK_ASSETS;
    return MOCK_ASSETS.filter(
      (a) =>
        (!searchTerm || a.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
        allowedFileTypes.includes(a.mimeType ?? "")
    );
  };

  const getDisabledAssets = () => {
    if (!isMaxSelection) return new Set<string>();

    return new Set(
      MOCK_ASSETS.filter(
        (asset) => !Array.from(selectedAssetIds).includes(asset.id)
      ).map((asset) => asset.id)
    );
  };

  const filteredAssets = getFilteredAssets();
  const disabledAssets = getDisabledAssets();

  if (isLoading && MOCK_ASSETS.length === 0) {
    return (
      <div
        data-testid="asset-viewer-loading"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <ProgressCircle aria-label="Loading assets" size="L" isIndeterminate />
      </div>
    );
  }

  return (
    <div
      data-testid="asset-viewer"
      style={{ display: "flex", flexDirection: "column", padding: "24px", gap: "16px" }}
    >
      <Heading>Asset Viewer</Heading>
      <SearchField
        value={searchTerm}
        onChange={handleSearchChange}
        aria-label="Search assets"
        placeholder="Search assets..."
        data-testid="asset-search"
      />

      <div
        data-testid="asset-viewer-ready"
        style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px" }}
      >
        {filteredAssets.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "32px",
              color: "#666",
            }}
          >
            {MOCK_ASSETS.length === 0
              ? "No assets available."
              : "No assets found matching your search."}
          </div>
        ) : (
          filteredAssets.map((asset) => (
            <button
              key={asset.id}
              type="button"
              role="listitem"
              data-testid={`asset-card-${asset.id}`}
              data-asset-id={asset.id}
              data-asset-name={asset.name}
              disabled={disabledAssets.has(asset.id) && !selectedAssetIds.has(asset.id)}
              onClick={() => {
                const newSelection = new Set(selectedAssetIds);
                if (newSelection.has(asset.id)) {
                  newSelection.delete(asset.id);
                } else {
                  newSelection.add(asset.id);
                }
                setSelectedAssets(newSelection);
                handleSelectionChange(newSelection);
              }}
              style={{
                padding: "12px 16px",
                textAlign: "left",
                border:
                  selectedAssetIds.has(asset.id) && !disabledAssets.has(asset.id)
                    ? "2px solid #1473E6"
                    : "1px solid #ccc",
                background: selectedAssetIds.has(asset.id)
                  ? "#E6F2FF"
                  : disabledAssets.has(asset.id)
                    ? "#f5f5f5"
                    : "#fff",
                borderRadius: "4px",
                cursor: disabledAssets.has(asset.id) ? "not-allowed" : "pointer",
                fontSize: "14px",
                opacity: disabledAssets.has(asset.id) ? 0.5 : 1,
              }}
            >
              <div style={{ fontWeight: "500" }}>{asset.name}</div>
              <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
                {asset.mimeType}
              </div>
            </button>
          ))
        )}
      </div>

      {selectedAssetIds.size > 0 && (
        <div
          data-testid="asset-selected-count"
          style={{
            marginTop: "12px",
            fontSize: "12px",
            color: "#666",
            textAlign: "center",
          }}
        >
          Selected: {selectedAssetIds.size} asset(s)
        </div>
      )}
    </div>
  );
}
