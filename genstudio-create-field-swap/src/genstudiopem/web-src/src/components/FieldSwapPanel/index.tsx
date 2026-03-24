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
import { EXTENSION_ID } from "../../Constants";
import {
  SwapFieldContext,
  SwapFieldExtensionService,
} from "@adobe/genstudio-extensibility-sdk";
import { useGuestConnection } from "../../hooks";

const SWAP_OPTIONS = [
  "Choose this option to replace subject",
  "Choose this option to replace headline",
  "Choose this option to replace body",
  "Choose this option to replace call to action",
];

export const FieldSwapPanel = (): React.JSX.Element => {
  const connection = useGuestConnection(EXTENSION_ID);
  const [fieldContext, setFieldContext] = useState<SwapFieldContext | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedValue, setSelectedValue] = useState<string | null>(null);

  useEffect(() => {
    if (!connection) return;
    const fetchFieldContext = async () => {
      console.log("fetchFieldContext");
      try {
        const ctx = await SwapFieldExtensionService.getFieldContext(connection);
        console.log(ctx);
        setFieldContext(ctx);
      } catch (err) {
        console.error("Failed to get field context:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFieldContext();
  }, [connection]);

  const handleCancel = (): void => {
    if (!connection) return;
    SwapFieldExtensionService.close(connection);
  };

  const handleConfirm = async (): Promise<void> => {
    if (!connection || !selectedValue) return;
    await SwapFieldExtensionService.swapField(connection, selectedValue);
    SwapFieldExtensionService.close(connection);
  };

  if (isLoading) {
    return <div style={{ padding: "1rem" }}>Loading...</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", backgroundColor: "white", padding: "1rem", height: "100vh", boxSizing: "border-box" }}>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {fieldContext && (
          <div style={{ marginBottom: "1rem" }}>
            <p style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>
              Current value:
            </p>
            <p
              style={{
                padding: "0.5rem",
                backgroundColor: "#f5f5f5",
                borderRadius: "4px",
                fontStyle: "italic",
              }}
            >
              {fieldContext.currentValue || "(empty)"}
            </p>
          </div>
        )}
        <p style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>
          Select a replacement:
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {SWAP_OPTIONS.map(opt => (
            <button
              key={opt}
              onClick={() => setSelectedValue(opt)}
              style={{
                padding: "0.5rem 1rem",
                border: `2px solid ${selectedValue === opt ? "#1473e6" : "#ccc"}`,
                borderRadius: "4px",
                backgroundColor: selectedValue === opt ? "#e8f0fe" : "white",
                cursor: "pointer",
                textAlign: "left",
                fontWeight: selectedValue === opt ? "bold" : "normal",
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", paddingTop: "1rem", borderTop: "1px solid #eee" }}>
        <button
          onClick={handleCancel}
          style={{
            padding: "0.5rem 1.25rem",
            border: "1px solid #ccc",
            borderRadius: "4px",
            backgroundColor: "white",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          disabled={!selectedValue}
          style={{
            padding: "0.5rem 1.25rem",
            border: "none",
            borderRadius: "4px",
            backgroundColor: selectedValue ? "#1473e6" : "#ccc",
            color: "white",
            cursor: selectedValue ? "pointer" : "not-allowed",
            fontWeight: "bold",
          }}
        >
          Confirm
        </button>
      </div>
    </div>
  );
};

export default FieldSwapPanel;
