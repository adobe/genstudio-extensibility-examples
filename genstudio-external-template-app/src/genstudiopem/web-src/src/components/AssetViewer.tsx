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

import React, { useEffect, useState, useRef } from "react";
import {
  Flex,
  View,
  Grid,
  SearchField,
  ProgressCircle,
  Well,
} from "@adobe/react-spectrum";
import AssetCard from "./AssetCard";
import AssetTypeFilter from "./AssetTypeFilter";
import { useAssetActions } from "../hooks/useAssetActions";
import { extensionId, extensionLabel, ICON_DATA_URI } from "../Constants";
import { Asset, ExtensionRegistrationService } from "@adobe/genstudio-extensibility-sdk";
import { attach } from "@adobe/uix-guest";
import { DamAsset } from "../types";

export default function AssetViewer(): JSX.Element {
  const [selectedAssets, setSelectedAssets] = useState<Asset[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentFilter, setCurrentFilter] = useState<string[]>([]);
  const [filterResetTrigger, setFilterResetTrigger] = useState(0);
  const [auth, setAuth] = useState<any>(null);
  const hasInitialLoad = useRef(false);

  const {
    assets,
    availableFileTypes,
    isLoading,
    fetchAssets,
    searchAssets,
    filterAssets,
    resetToBaseAssets,
    error,
    addLocalHtmlAsset,
  } = useAssetActions(auth);

  const [guestConnection, setGuestConnection] = useState<any>(null);

  useEffect(() => {
    debugger;
    fetchAssets();
  }, [fetchAssets]);

  useEffect(() => {
    if (assets.length > 0 && !hasInitialLoad.current) {
      hasInitialLoad.current = true;
    }
  }, [assets.length]);

  const convertToGenStudioAsset = (asset: DamAsset): Asset => {
    return {
      id: asset.id,
      name: asset.name,
      signedUrl: asset.url,
      source: extensionLabel,
      sourceUrl: asset.url,
      extensionId: extensionId,
      iconUrl: ICON_DATA_URI,
    };
  };

  useEffect(() => {
    (async () => {
      try {
        const connection = await attach({ id: extensionId });
        setGuestConnection(connection);
      } catch (error) {
        console.warn(
          "Failed to attach to GenStudio host (likely running in standalone mode):",
          error
        );
        setGuestConnection(null);
      }
    })();
  }, [extensionId]);

  useEffect(() => {
    const sharedAuth = guestConnection?.sharedContext.get("auth");
    if (sharedAuth) {
      setAuth(sharedAuth);
    }
  }, [guestConnection]);

  useEffect(() => {
    if (!hasInitialLoad.current) {
      return;
    }

    // Search assets when search term changes
    if (searchTerm.trim()) {
      const delaySearch = setTimeout(() => {
        searchAssets(searchTerm);
        setCurrentFilter([]);
        setFilterResetTrigger((prev) => prev + 1);
      }, 500);
      return () => clearTimeout(delaySearch);
    } else if (searchTerm === "") {
      resetToBaseAssets();
      setCurrentFilter([]);
      setFilterResetTrigger((prev) => prev + 1);
    }
  }, [searchTerm]);

  const handleFilterChange = (fileTypes: string[]) => {
    setCurrentFilter(fileTypes);
    filterAssets(fileTypes, searchTerm);
  };

  const handleAssetSelect = async (asset: DamAsset) => {
    const { selectionLimit } =
      await ExtensionRegistrationService.selectContentExtensionSync(
        guestConnection
      );

    const isSelected = selectedAssets.some((a) => a.id === asset.id);

    let newSelectedAssets: Asset[] = [...selectedAssets];

    if (isSelected) {
      newSelectedAssets = selectedAssets.filter((a) => a.id !== asset.id);
    } else if (selectedAssets.length < selectionLimit) {
      newSelectedAssets = [...selectedAssets, convertToGenStudioAsset(asset)];
    }

    setSelectedAssets(newSelectedAssets);

    if (!guestConnection) return;

    try {
      await ExtensionRegistrationService.selectContentExtensionSetSelectedAssets(
        guestConnection,
        extensionId,
        newSelectedAssets
      );
    } catch (error) {
      console.warn("Error sending selected assets to host:", error);
    }
  };

  const renderAssetContent = () => {
    if (isLoading) {
      return (
        <Flex alignItems="center" justifyContent="center" height="100%">
          <ProgressCircle aria-label="Loading assets" isIndeterminate />
        </Flex>
      );
    }

    if (assets.length === 0) {
      return <Well>No assets found. Try a different search term.</Well>;
    }

    return (
      <Grid
        columns="repeat(auto-fill, 230px)"
        autoRows="auto"
        justifyContent="center"
        gap="size-300"
        width="100%"
      >
        {assets.map((asset) => renderAsset(asset))}
      </Grid>
    );
  };

  useEffect(() => {
    const getAssets = async () => {
      const { selectedAssets } =
        await ExtensionRegistrationService.selectContentExtensionSync(
          guestConnection
        );

      if (selectedAssets) {
        const assets = selectedAssets.map((asset: any) =>
          convertToGenStudioAsset(asset)
        );
        setSelectedAssets((prevAssets) => {
          const localAssets = prevAssets.filter(
            (asset) =>
              !assets.some((extAsset: Asset) => extAsset.id === asset.id)
          );
          return [...localAssets, ...assets];
        });
      }
    };
    if (guestConnection) getAssets();
  }, [guestConnection]);

  const renderAsset = (asset: DamAsset) => {
    const isSelected = selectedAssets?.some((a) => a.id === asset.id);

    return (
      <AssetCard
        key={asset.id}
        asset={asset}
        isSelected={isSelected}
        onSelect={handleAssetSelect}
      />
    );
  };

  return (
    <View height="100%" width="100%">
      <style>
        {`
          .search-field-custom input[type="search"] {
            border-radius: 16px !important;
            border: 2px solid var(--Palette-gray-300, #DADADA) !important;
            background: var(--Palette-gray-25, #FFF) !important;
          }
        `}
      </style>
      <Flex direction="column" height="100%">
        <View
          UNSAFE_style={{ backgroundColor: "var(--spectrum-gray-100)" }}
          padding="size-300"
        >
          <Flex
            direction="row"
            justifyContent="center"
            alignItems="center"
            gap="size-200"
          >
            <SearchField
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search for assets"
              width="400px"
              maxWidth="90%"
              UNSAFE_className="search-field-custom"
            />
            <input
              type="file"
              accept=".html,text/html"
              onChange={async (e) => {
                const input = e.currentTarget;
                const f = input.files?.[0];
                input.value = "";
                if (f) await addLocalHtmlAsset(f);
              }}
            />
          </Flex>
        </View>

        <View
          UNSAFE_style={{ backgroundColor: "var(--spectrum-gray-100)" }}
          paddingX="size-300"
          paddingTop="size-100"
          paddingBottom="size-150"
        >
          <Flex
            direction="row"
            justifyContent="start"
            alignItems="center"
            gap="size-200"
          >
            <AssetTypeFilter
              availableFileTypes={availableFileTypes}
              onFilterChange={handleFilterChange}
              resetTrigger={filterResetTrigger}
            />
          </Flex>
        </View>

        <View
          flex={1}
          UNSAFE_style={{ backgroundColor: "var(--spectrum-gray-100)" }}
          padding="size-300"
          overflow="auto"
        >
          {renderAssetContent()}
        </View>
      </Flex>
    </View>
  );
}
