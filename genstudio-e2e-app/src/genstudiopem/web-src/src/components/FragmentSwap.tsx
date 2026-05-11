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

import React, { useEffect, useState } from "react";
import { Heading } from "@react-spectrum/s2";
import {
  Experience,
  FieldUpdate,
  FragmentSwapExtensionService,
  GenerationContext,
} from "@adobe/genstudio-extensibility-sdk";
import { EXTENSION_ID } from "../Constants";
import { useGuestConnection, useAuth } from "../hooks";

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

const SWAP_VALUE = "E2E Swapped Content";

export default function FragmentSwap(): React.JSX.Element {
  const guestConnection = useGuestConnection(EXTENSION_ID);
  const auth = useAuth(guestConnection);
  const [selectedField, setSelectedField] = useState<FieldUpdate | null>(null);
  const [experience, setExperience] = useState<Experience | null>(null);
  const [generationContext, setGenerationContext] = useState<GenerationContext | null>(null);
  const [swapped, setSwapped] = useState(false);

  useEffect(() => {
    if (!guestConnection) return;
    Promise.all([
      FragmentSwapExtensionService.getSelectedField(guestConnection),
      FragmentSwapExtensionService.getGenerationContext(guestConnection),
      FragmentSwapExtensionService.getExperience(guestConnection),
    ])
      .then(([field, ctx, exp]) => {
        setSelectedField(field);
        setGenerationContext(ctx);
        setExperience(exp);
      })
      .catch(console.error);
  }, [guestConnection]);

  const ready = Boolean(auth && guestConnection);

  return (
    <div data-testid="fragment-swap-dialog" style={{ padding: "24px" }}>
      <Heading>Fragment Swap (E2E)</Heading>

      {!ready ? (
        <div data-testid="fragment-swap-loading">Connecting to host...</div>
      ) : (
        <>
          <div data-testid="auth-context-box" style={jsonBoxStyle}>
            {JSON.stringify({ imsToken: auth?.imsToken ? "present" : "missing", imsOrg: auth?.imsOrg ? "present" : "missing" }, null, 2)}
          </div>

          <Heading level={4}>Generation Context</Heading>
          <div data-testid="generation-context-box" style={jsonBoxStyle}>
            {JSON.stringify(generationContext, null, 2)}
          </div>

          <Heading level={4}>Experience</Heading>
          <div data-testid="experience-box" style={jsonBoxStyle}>
            {JSON.stringify(experience, null, 2)}
          </div>

          <Heading level={4}>Selected Field</Heading>
          <div data-testid="selected-field-box" style={jsonBoxStyle}>
            {JSON.stringify(selectedField, null, 2)}
          </div>

          <button
            type="button"
            data-testid="swap-button"
            onClick={() => {
              if (!guestConnection) return;
              FragmentSwapExtensionService.setSwapValue(guestConnection, SWAP_VALUE);
              setSwapped(true);
            }}
            style={{
              marginTop: "12px",
              padding: "8px 24px",
              background: "#1473E6",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Swap
          </button>

          {swapped && (
            <div data-testid="swap-result-box" style={jsonBoxStyle}>
              {JSON.stringify({ swappedValue: SWAP_VALUE }, null, 2)}
            </div>
          )}
        </>
      )}
    </div>
  );
}
