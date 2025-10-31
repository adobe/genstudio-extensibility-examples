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
import { AssetCard } from "./AssetCard";
import { useAssetActions } from "../hooks/useAssetActions";
import { extensionId, extensionLabel, ICON_DATA_URI } from "../Constants";
import { SelectContentExtensionService } from "@adobe/genstudio-extensibility-sdk";
import { useGuestConnection } from "../hooks";
import { Selection } from "@react-types/shared";

export default function AssetViewer(): JSX.Element {
  const [selectedAssetIds, setSelectedAssets] = useState<Selection>(new Set());
  const [isMaxSelection, setIsMaxSelection] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [auth, setAuth] = useState<any>(null);
  const guestConnection = useGuestConnection(extensionId);

  const { assets, isLoading, fetchAssets } = useAssetActions(auth);

  const filteredAssets = !searchTerm
    ? assets
    : assets.filter((a) =>
        (a.name ?? "").toLowerCase().includes(searchTerm.toLowerCase())
      );

  const syncHostAssets = async () => {
    if (!guestConnection) return;
    const { selectedAssets } = await SelectContentExtensionService.sync(
      guestConnection,
      extensionId
    );
    if (selectedAssets)
      setSelectedAssets(new Set(selectedAssets.map((asset) => asset.id)));
  };

  const handleSelectionChange = async (selection: Selection) => {
    if (!guestConnection) return;
    const { selectionLimit } = await SelectContentExtensionService.sync(
      guestConnection,
      extensionId
    );
    const selectedAssetIdsList = Array.from(selection);
    // show all other assets as disabled if max selection is reached
    setIsMaxSelection(selectedAssetIdsList.length >= selectionLimit);
    if (selectedAssetIdsList.length > selectionLimit) return;

    const selectedAssets = assets.filter((asset) =>
      selectedAssetIdsList.includes(asset.id)
    );
    const extensionInfo = {
      id: guestConnection?.id,
      name: extensionLabel,
      iconUrl: ICON_DATA_URI,
    };
    try {
      const newSelectedAssets = selectedAssets.map((asset) => ({
        ...asset,
        extensionInfo,
      }));
      SelectContentExtensionService.setSelectedAssets(
        guestConnection,
        extensionId,
        newSelectedAssets
      );
      await syncHostAssets();
    } catch (error) {
      console.warn("Error sending selected assets to host:", error);
    }
  };

  useEffect(() => {
    if (!guestConnection) return;
    const sharedAuth = guestConnection.sharedContext.get("auth");
    if (sharedAuth) setAuth(sharedAuth);
    syncHostAssets();
  }, [guestConnection]);

  useEffect(() => {
    if (auth) fetchAssets();
  }, [auth, fetchAssets]);

  const renderAssetContent = () => {
    if (filteredAssets.length === 0) {
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "200px",
            width: "100%",
            fontSize: "1.2rem",
            color: "#666",
            textAlign: "center",
          }}
        >
          No assets found.
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
        disabledKeys={
          isMaxSelection
            ? assets
                .filter(
                  (asset) => !Array.from(selectedAssetIds).includes(asset.id)
                )
                .map((asset) => asset.id)
            : undefined
        }
      >
        {filteredAssets.map((asset) => (
          <AssetCard key={asset.id} asset={asset} />
        ))}
      </CardView>
    );
  };

  const containerStyles = {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
  };

  return isLoading ? (
    <div
      style={{
        ...containerStyles,
        justifyContent: "center",
        height: "100%",
      }}
    >
      <ProgressCircle aria-label="Loading assets" size="L" isIndeterminate />
    </div>
  ) : (
    <div
      style={{
        ...containerStyles,
        padding: "32px 32px",
      }}
    >
      <SearchField
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Search assets"
        width="400px"
      />
      <div style={{ width: "100%", marginTop: "24px" }}>
        {renderAssetContent()}
      </div>
    </div>
  );
}
