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
import { CardView, SearchField, ProgressCircle } from "@react-spectrum/s2";
import { Selection } from "@react-types/shared";
import { SelectContentExtensionService } from "@adobe/genstudio-extensibility-sdk";
import { AssetCard } from "./AssetCard";
import { useAuth, useGuestConnection, useAssetActions } from "../hooks";
import { EXTENSION_ID, EXTENSION_LABEL, ICON_DATA_URI } from "../Constants";

export default function AssetViewer(): JSX.Element {
  // ==========================================================
  //                    STATE & HOOKS
  // ==========================================================
  const [selectedAssetIds, setSelectedAssets] = useState<Selection>(new Set());
  const [isMaxSelection, setIsMaxSelection] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [allowedFileTypes, setAllowedFileTypes] = useState<string[]>([]);

  const guestConnection = useGuestConnection(EXTENSION_ID);
  const auth = useAuth(guestConnection);
  const { assets, isLoading, fetchAssets } = useAssetActions(auth);

  // ==========================================================
  //                    EFFECTS & HOOKS
  // ==========================================================

  /**
   * Initialize component by syncing with host and establishing auth
   */
  useEffect(() => {
    if (!guestConnection) return;
    syncHostAssets();
  }, [guestConnection]);

  /**
   * Fetch assets when auth becomes available
   */
  useEffect(() => {
    if (auth) {
      fetchAssets();
    }
  }, [auth, fetchAssets]);

  // ==========================================================
  //                    HANDLERS & FUNCTIONS
  // ==========================================================

  /**
   * Syncs the selected assets from the host application
   * Updates local selection state to match host state
   */
  const syncHostAssets = async () => {
    if (!guestConnection) return;

    const { selectedAssets, allowedFileTypes } =
      await SelectContentExtensionService.sync(guestConnection, EXTENSION_ID);

    console.log(
      "===x DAM Ext selectedAssets",
      selectedAssets,
      allowedFileTypes,
    );
    if (selectedAssets) {
      setSelectedAssets(
        new Set(
          selectedAssets
            .filter((asset) => asset.extensionInfo.id === EXTENSION_ID)
            .map((asset) => asset.id),
        ),
      );
    }
    if (allowedFileTypes) setAllowedFileTypes(allowedFileTypes);
  };

  /**
   * Handles asset selection changes
   * Enforces selection limits and syncs with host application
   * @param selection - New selection set
   */
  const handleSelectionChange = async (selection: Selection) => {
    if (!guestConnection) return;

    const { selectionLimit } = await SelectContentExtensionService.sync(
      guestConnection,
      EXTENSION_ID,
    );

    const selectedAssetIdsList = Array.from(selection);

    // Show all other assets as disabled if max selection is reached
    setIsMaxSelection(selectedAssetIdsList.length >= selectionLimit);

    if (selectedAssetIdsList.length > selectionLimit) return;

    const selectedAssets = assets.filter((asset) =>
      selectedAssetIdsList.includes(asset.id),
    );

    try {
      const newSelectedAssets = selectedAssets.map((asset) => ({
        ...asset,
        extensionInfo: {
          id: EXTENSION_ID,
          name: EXTENSION_LABEL,
          iconUrl: ICON_DATA_URI,
        },
      }));

      SelectContentExtensionService.setSelectedAssets(
        guestConnection,
        EXTENSION_ID,
        newSelectedAssets,
      );

      syncHostAssets();
    } catch (error) {
      console.warn("Error sending selected assets to host:", error);
    }
  };

  /**
   * Handles search term changes
   * @param value - New search term
   */
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  /**
   * Filters assets based on search term
   * @returns Filtered asset array
   */
  const getFilteredAssets = () => {
    if (!allowedFileTypes.length) return assets;
    return assets.filter(
      (a) =>
        (!searchTerm ||
          (a.name ?? "").toLowerCase().includes(searchTerm.toLowerCase())) &&
        allowedFileTypes.includes(a.mimeType ?? ""),
    );
  };

  /**
   * Gets disabled asset keys based on max selection state
   * @returns Array of disabled asset IDs or undefined
   */
  const getDisabledKeys = () => {
    if (!isMaxSelection) return undefined;

    return assets
      .filter((asset) => !Array.from(selectedAssetIds).includes(asset.id))
      .map((asset) => asset.id);
  };

  // ==========================================================
  //                        RENDER
  // ==========================================================
  const filteredAssets = getFilteredAssets();

  const containerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  };

  const contentContainerStyle: React.CSSProperties = {
    width: "100%",
    marginTop: "24px",
  };

  const centerContentStyle: React.CSSProperties = {
    ...containerStyle,
    justifyContent: "center",
    height: "100%",
  };

  const emptyStateStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "200px",
    width: "100%",
    fontSize: "1.2rem",
    color: "#666",
    textAlign: "center",
  };

  /**
   * Renders the asset content based on loading and data state
   */
  const renderAssetContent = () => {
    if (filteredAssets.length === 0) {
      return (
        <div style={emptyStateStyle}>
          {assets.length === 0
            ? "No assets available."
            : "No assets found matching your search."}
        </div>
      );
    }

    return (
      <CardView
        aria-label="Assets"
        loadingState={isLoading ? "loading" : "idle"}
        selectionMode="multiple"
        selectedKeys={selectedAssetIds}
        onSelectionChange={handleSelectionChange}
        disabledKeys={getDisabledKeys()}
      >
        {filteredAssets.map((asset) => (
          <AssetCard key={asset.id} asset={asset} />
        ))}
      </CardView>
    );
  };

  // Show loading state for initial load
  if (isLoading && assets.length === 0) {
    return (
      <div style={centerContentStyle}>
        <ProgressCircle aria-label="Loading assets" size="L" isIndeterminate />
      </div>
    );
  }

  return (
    <div style={{ ...containerStyle, padding: "32px 32px" }}>
      <SearchField
        value={searchTerm}
        onChange={handleSearchChange}
        aria-label="Search assets"
        UNSAFE_style={{ width: "400px" }}
      />
      <div style={contentContainerStyle}>{renderAssetContent()}</div>
    </div>
  );
}
