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
import { Button, ButtonGroup, Heading, Text } from "@react-spectrum/s2";
import {
  FieldUpdate,
  FragmentSwapExtensionService,
  GenerationContext,
} from "@adobe/genstudio-extensibility-sdk";
import { EXTENSION_ID } from "../../Constants";
import { useGuestConnection, useAuth } from "../../hooks";

const SWAP_OPTIONS: Array<{ id: string; label: string; value: string }> = [
  {
    id: "rewrite-short",
    label: "Shorten",
    value: "A shorter, clearer version optimized for mobile readability.",
  },
  {
    id: "rewrite-action",
    label: "Stronger CTA",
    value: "Act now to discover measurable benefits with confidence.",
  },
];

export default function FragmentSwapDialog(): React.JSX.Element {
  const guestConnection = useGuestConnection(EXTENSION_ID);
  const auth = useAuth(guestConnection);
  const [selectedField, setSelectedField] = useState<FieldUpdate | null>(null);
  const [generationContext, setGenerationContext] =
    useState<GenerationContext | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadContext = async () => {
      if (!guestConnection) return;
      try {
        const [field, context] = await Promise.all([
          FragmentSwapExtensionService.getSelectedField(guestConnection),
          FragmentSwapExtensionService.getGenerationContext(guestConnection),
        ]);
        setSelectedField(field);
        setGenerationContext(context);
        setError(null);
      } catch (loadError) {
        console.error("Failed to load fragment swap context", loadError);
        setError("Failed to read fragment swap context from host.");
      }
    };

    loadContext().catch(console.error);
  }, [guestConnection]);

  const applySwap = (value: string) => {
    if (!guestConnection) return;
    try {
      FragmentSwapExtensionService.setSwapValue(guestConnection, value);
    } catch (applyError) {
      console.error("Failed to apply swap value", applyError);
      setError("Failed to apply swap value.");
    }
  };

  return (
    <div data-testid="fragment-swap-dialog" style={{ padding: "24px" }}>
      <Heading>Fragment Swap Dialog (E2E)</Heading>
      <Text UNSAFE_style={{ marginBottom: "12px" }}>
        {auth
          ? "Connected to host. Ready to apply deterministic swap values."
          : "Connecting to host..."}
      </Text>

      {auth ? (
        <>
          <div
            data-testid="fragment-swap-context"
            style={{ border: "1px solid #ddd", borderRadius: "4px", padding: "10px" }}
          >
            <Text data-testid="fragment-swap-field">
              field: {selectedField?.name || ""}
            </Text>
            <Text data-testid="fragment-swap-current-value">
              currentValue: {selectedField?.value || ""}
            </Text>
            <Text data-testid="fragment-swap-channel">
              channel: {generationContext?.channel?.id || ""}
            </Text>
            {error ? (
              <Text data-testid="fragment-swap-error" UNSAFE_style={{ color: "#C9252D" }}>
                {error}
              </Text>
            ) : null}
          </div>

          <ButtonGroup UNSAFE_style={{ marginTop: "16px" }}>
            {SWAP_OPTIONS.map((option) => (
              <Button
                key={option.id}
                data-testid={`fragment-swap-apply-${option.id}`}
                variant="primary"
                onPress={() => applySwap(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </ButtonGroup>
        </>
      ) : null}
    </div>
  );
}
