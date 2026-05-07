/*
Copyright 2026 Adobe. All rights reserved.
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
import {
  SelectContentExtensionService,
  Asset,
} from "@adobe/genstudio-extensibility-sdk";
import { useGuestConnection, useAuth, useSelectContent } from "../hooks";
import { EXTENSION_ID, EXTENSION_LABEL, ICON_DATA_URI } from "../Constants";

const jsonBoxStyle: React.CSSProperties = {
  padding: "12px",
  margin: "8px 0",
  border: "1px solid #ccc",
  borderRadius: "4px",
  background: "#f5f5f5",
  fontFamily: "monospace",
  fontSize: "12px",
  whiteSpace: "pre-wrap",
  wordBreak: "break-all",
};

export default function SelectContent(): React.JSX.Element {
  const guestConnection = useGuestConnection(EXTENSION_ID);
  const auth = useAuth(guestConnection);
  const { assets, isLoading, error, fetchAssets } = useSelectContent(auth);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [syncData, setSyncData] = useState<{ selectedAssets: Asset[]; selectionLimit: number } | null>(null);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  useEffect(() => {
    if (!guestConnection) return;
    const doSync = async () => {
      try {
        const result = await SelectContentExtensionService.sync(guestConnection, EXTENSION_ID);
        setSyncData(result);
        const ids = (result.selectedAssets || [])
          .filter((a) => a.extensionInfo?.id === EXTENSION_ID)
          .map((a) => a.id);
        setSelectedIds(new Set(ids));
      } catch (e) {
        console.error("sync failed", e);
      }
    };
    doSync();
  }, [guestConnection]);

  const buildSelectedAssets = (ids: Set<string>) =>
    assets
      .filter((a) => ids.has(a.id))
      .map((a) => ({
        ...a,
        extensionInfo: { id: EXTENSION_ID, name: EXTENSION_LABEL, iconUrl: ICON_DATA_URI },
        additionalMetadata: { testMetadata: "select-content" },
        keywords: ["testKeyword"],
      }));

  const toggleAsset = (asset: Asset) => {
    if (!guestConnection) return;
    const next = new Set(selectedIds);
    if (next.has(asset.id)) {
      next.delete(asset.id);
    } else {
      next.add(asset.id);
    }
    setSelectedIds(next);
    SelectContentExtensionService.setSelectedAssets(guestConnection, EXTENSION_ID, buildSelectedAssets(next));
  };

  const ready = Boolean(auth && guestConnection);

  if (isLoading) return <div data-testid="select-content-loading">Loading assets...</div>;
  if (error) return <div data-testid="select-content-error">{error}</div>;

  return (
    <div data-testid="select-content-panel" style={{ padding: 24 }}>
      <Heading>Select Content (E2E)</Heading>

      {!ready ? (
        <div data-testid="select-content-loading">Connecting to host...</div>
      ) : (
        <>
          <div data-testid="auth-context-box" style={jsonBoxStyle}>
            {JSON.stringify({ imsToken: auth?.imsToken ? "present" : "missing", imsOrg: auth?.imsOrg ? "present" : "missing" }, null, 2)}
          </div>

          <div data-testid="sync-data-box" style={jsonBoxStyle}>
            {JSON.stringify(syncData, null, 2)}
          </div>

          <Heading level={4}>Assets ({assets.length})</Heading>
          <ul data-testid="asset-list" style={{ listStyle: "none", padding: 0 }}>
            {assets.map((asset) => {
              const isSelected = selectedIds.has(asset.id);
              return (
                <li key={asset.id} style={{ marginBottom: "6px" }}>
                  <button
                    type="button"
                    data-testid={`asset-${asset.id}`}
                    data-asset-id={asset.id}
                    aria-pressed={isSelected}
                    onClick={() => toggleAsset(asset)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "8px 12px",
                      border: isSelected ? "2px solid #1473E6" : "1px solid #ccc",
                      background: isSelected ? "#E6F2FF" : "#fff",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "13px",
                    }}
                  >
                    {asset.name}
                  </button>
                </li>
              );
            })}
          </ul>

          <div data-testid="selected-assets-box" style={jsonBoxStyle}>
            {JSON.stringify(buildSelectedAssets(selectedIds), null, 2)}
          </div>
        </>
      )}
    </div>
  );
}
