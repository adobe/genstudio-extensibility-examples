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
import { Heading, Text, Button, ButtonGroup, Checkbox } from "@react-spectrum/s2";
import { useGuestConnection, useAuth } from "../../hooks";
import { EXTENSION_ID } from "../../Constants";
import {
  AdditionalContext,
  AdditionalContextTypes,
  GenerationContext,
  PromptExtensionService,
} from "@adobe/genstudio-extensibility-sdk";

type Claim = {
  id: string;
  description: string;
  category: "efficacy" | "safety" | "usage";
};

const SAMPLE_CLAIMS: Claim[] = [
  {
    id: "efficacy-claim-1",
    category: "efficacy",
    description: "Clinically proven to reduce joint inflammation by up to 50%.",
  },
  {
    id: "efficacy-claim-2",
    category: "efficacy",
    description: "Demonstrates a 60% improvement in joint mobility over 6 months.",
  },
  {
    id: "efficacy-claim-3",
    category: "efficacy",
    description: "Supports measurable improvement in daily movement comfort within 14 days.",
  },
  {
    id: "safety-claim-1",
    category: "safety",
    description: "Formulated without added parabens or artificial dyes.",
  },
  {
    id: "usage-claim-1",
    category: "usage",
    description: "Intended for adults seeking daily joint support as part of a wellness routine.",
  },
];

export default function PromptDialog(): React.JSX.Element {
  const guestConnection = useGuestConnection(EXTENSION_ID);
  const auth = useAuth(guestConnection);
  const [selectedClaims, setSelectedClaims] = useState<Claim[]>([]);
  const [generationContext, setGenerationContext] =
    useState<GenerationContext | null>(null);
  const [contextError, setContextError] = useState<string | null>(null);

  useEffect(() => {
    const loadContext = async () => {
      if (!guestConnection) return;
      try {
        const ctx = await PromptExtensionService.getGenerationContext(guestConnection);
        setGenerationContext(ctx);
        const claimsContext = (ctx.additionalContexts || []).find(
          (item) =>
            item.extensionId === EXTENSION_ID &&
            item.additionalContextType === AdditionalContextTypes.Claims,
        );
        if (claimsContext?.additionalContextValues?.length) {
          // additionalContextValues are JSON strings — parse each one back to a Claim object
          const preselectedIds = new Set<string>();
          claimsContext.additionalContextValues.forEach((value) => {
            try {
              const parsed = typeof value === 'string' ? JSON.parse(value) : value;
              if (parsed?.id) preselectedIds.add(parsed.id);
            } catch {
              // Invalid JSON — skip this value
            }
          });
          setSelectedClaims(
            SAMPLE_CLAIMS.filter((claim) => preselectedIds.has(claim.id)),
          );
        }
        setContextError(null);
      } catch (error) {
        console.error("Failed to fetch generation context", error);
        setContextError("Failed to read generation context from host.");
      }
    };

    loadContext().catch(console.error);
  }, [guestConnection]);

  const handleClaimChange = (claim: Claim) => {
    setSelectedClaims((prev) =>
      prev.some((c) => c.id === claim.id)
        ? prev.filter((c) => c.id !== claim.id)
        : [...prev, claim]
    );
  };

  const handleCancel = () => {
    if (guestConnection?.host?.api?.promptExtension?.close) {
      guestConnection.host.api.promptExtension.close();
    }
  };

  const handleOK = async () => {
    if (!guestConnection) return;
    // additionalContextValues must be JSON-stringified before sending to host.
    // The host uses these strings to deserialize, count selected claims,
    // and update the "Select claims" dropdown label. If sent as raw objects,
    // the host can't parse them → label never updates.
    const claimsContext: AdditionalContext<string> = {
      extensionId: EXTENSION_ID,
      additionalContextType: AdditionalContextTypes.Claims,
      additionalContextValues: selectedClaims.map((claim) => JSON.stringify(claim)),
    };
    // First persist the selected claims into the host's generation context …
    PromptExtensionService.updateAdditionalContext(guestConnection, claimsContext as any);
    // … then close the dialog so the host refreshes its claims count/label in the
    // prompt drawer. Without this close() the host never receives the "done" signal
    // and the add-on button label stays at the default "Select Claims" state even
    // though the context was saved (which is why reopening the dialog still shows
    // the preselected values — they were persisted, just never surfaced to the UI).
    PromptExtensionService.close(guestConnection);
  };

  const sharedAuth = guestConnection?.sharedContext?.get("auth") || {};
  const apiKey =
    sharedAuth?.apiKey ||
    guestConnection?.sharedContext?.get("apiKey") ||
    "";

  const hasImsToken = Boolean(auth?.imsToken);
  const hasImsOrg = Boolean(auth?.imsOrg);
  const hasApiKey = Boolean(apiKey);

  return (
    <div data-testid="prompt-dialog" style={{ padding: "24px" }}>
      <Heading>Prompt Dialog (E2E)</Heading>
      <Text UNSAFE_style={{ marginBottom: "16px" }}>
        {auth
          ? "Connected to host. Ready to inject prompt data."
          : "Connecting to host..."}
      </Text>
      {auth && (
        <div>
          <div
            data-testid="prompt-auth-panel"
            style={{ marginBottom: "16px", padding: "8px", border: "1px solid #ddd", borderRadius: "4px" }}
          >
            <Heading level={4}>Auth + Context Health</Heading>
            <Text data-testid="prompt-auth-token-present">imsToken: {hasImsToken ? "present" : "missing"}</Text>
            <Text data-testid="prompt-auth-org-present">imsOrgId: {hasImsOrg ? "present" : "missing"}</Text>
            <Text data-testid="prompt-auth-apikey-present">apiKey: {hasApiKey ? "present" : "missing"}</Text>
            {contextError ? (
              <Text data-testid="prompt-context-error" UNSAFE_style={{ color: "#C9252D" }}>
                {contextError}
              </Text>
            ) : (
              <div data-testid="prompt-generation-context" style={{ marginTop: "8px" }}>
                <Text data-testid="prompt-context-channel">
                  channel: {generationContext?.channel?.id || ""}
                </Text>
                <Text data-testid="prompt-context-brand">
                  brand: {generationContext?.brand?.id || ""}
                </Text>
                <Text data-testid="prompt-context-product">
                  product: {generationContext?.product?.id || ""}
                </Text>
                <Text data-testid="prompt-context-persona">
                  persona: {generationContext?.persona?.id || ""}
                </Text>
                <Text data-testid="prompt-context-prompt">
                  prompt: {generationContext?.userPrompt || ""}
                </Text>
              </div>
            )}
          </div>

          <div data-testid="claim-list" style={{ marginBottom: "16px" }}>
            {SAMPLE_CLAIMS.map((claim) => (
              <div key={claim.id} style={{ marginBottom: "8px" }}>
                <Checkbox
                  data-testid={`claim-checkbox-${claim.id}`}
                  isSelected={selectedClaims.some((c) => c.id === claim.id)}
                  onChange={() => handleClaimChange(claim)}
                >
                  {claim.description}
                </Checkbox>
              </div>
            ))}
          </div>
          <ButtonGroup>
            <Button data-testid="claim-cancel-button" variant="secondary" onPress={handleCancel}>
              Cancel
            </Button>
            <Button data-testid="claim-ok-button" variant="primary" onPress={handleOK}>
              OK
            </Button>
          </ButtonGroup>
        </div>
      )}
    </div>
  );
}
