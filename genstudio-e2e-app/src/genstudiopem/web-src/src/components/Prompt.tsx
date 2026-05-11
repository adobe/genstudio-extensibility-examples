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
import {
  AdditionalContext,
  AdditionalContextTypes,
  GenerationContext,
  PromptExtensionService,
} from "@adobe/genstudio-extensibility-sdk";
import { useGuestConnection, useAuth } from "../hooks";
import { EXTENSION_ID } from "../Constants";

interface Claim {
  id: string;
  description: string;
  category: string;
}

const CLAIMS: Claim[] = [
  { id: "efficacy-1", category: "efficacy", description: "Clinically proven to reduce joint inflammation by up to 50%." },
  { id: "efficacy-2", category: "efficacy", description: "Demonstrates a 60% improvement in joint mobility over 6 months." },
  { id: "safety-1", category: "safety", description: "Formulated without added parabens or artificial dyes." },
  { id: "usage-1", category: "usage", description: "Intended for adults seeking daily joint support." },
];

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

export default function Prompt(): React.JSX.Element {
  const guestConnection = useGuestConnection(EXTENSION_ID);
  const auth = useAuth(guestConnection);
  const [generationContext, setGenerationContext] = useState<GenerationContext | null>(null);
  const [selectedClaims, setSelectedClaims] = useState<Claim[]>([]);

  useEffect(() => {
    if (!guestConnection) return;
    PromptExtensionService.getGenerationContext(guestConnection)
      .then((ctx) => {
        setGenerationContext(ctx);
        const existing = (ctx.additionalContexts || []).find(
          (c) => c.extensionId === EXTENSION_ID && c.additionalContextType === AdditionalContextTypes.Claims,
        );
        if (existing?.additionalContextValues?.length) {
          const ids = new Set<string>();
          existing.additionalContextValues.forEach((v) => {
            try {
              const parsed = typeof v === "string" ? JSON.parse(v) : v;
              if (parsed?.id) ids.add(parsed.id);
            } catch { /* skip */ }
          });
          setSelectedClaims(CLAIMS.filter((c) => ids.has(c.id)));
        }
      })
      .catch(console.error);
  }, [guestConnection]);

  const toggleClaim = (claim: Claim) => {
    setSelectedClaims((prev) =>
      prev.some((c) => c.id === claim.id)
        ? prev.filter((c) => c.id !== claim.id)
        : [...prev, claim],
    );
  };

  const handleConfirm = async () => {
    if (!guestConnection) return;
    const ctx: AdditionalContext<Claim> = {
      extensionId: EXTENSION_ID,
      additionalContextType: AdditionalContextTypes.Claims,
      additionalContextValues: selectedClaims,
    };
    PromptExtensionService.updateAdditionalContext(guestConnection, ctx as any);
    PromptExtensionService.close(guestConnection);
  };

  const ready = Boolean(auth && guestConnection);

  return (
    <div data-testid="prompt-dialog" style={{ padding: "24px" }}>
      <h1>Prompt Dialog (E2E)</h1>

      {!ready ? (
        <div data-testid="prompt-loading">Connecting to host...</div>
      ) : (
        <>
          <div data-testid="auth-context-box" style={jsonBoxStyle}>
            {JSON.stringify({ imsToken: auth?.imsToken ? "present" : "missing", imsOrg: auth?.imsOrg ? "present" : "missing" }, null, 2)}
          </div>

          <div data-testid="generation-context-box" style={jsonBoxStyle}>
            {JSON.stringify(generationContext, null, 2)}
          </div>

          <h3>Claims</h3>
          <ul data-testid="claim-list" style={{ listStyle: "none", padding: 0 }}>
            {CLAIMS.map((claim) => {
              const isSelected = selectedClaims.some((c) => c.id === claim.id);
              return (
                <li key={claim.id} style={{ marginBottom: "6px" }}>
                  <button
                    type="button"
                    data-testid={`claim-${claim.id}`}
                    data-claim-id={claim.id}
                    aria-pressed={isSelected}
                    onClick={() => toggleClaim(claim)}
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
                    [{claim.category}] {claim.description}
                  </button>
                </li>
              );
            })}
          </ul>

          {selectedClaims.length > 0 && (
            <div data-testid="selected-claims-box" style={jsonBoxStyle}>
              {JSON.stringify(selectedClaims, null, 2)}
            </div>
          )}

          <button
            type="button"
            data-testid="claim-confirm-button"
            onClick={handleConfirm}
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
            Confirm
          </button>
        </>
      )}
    </div>
  );
}
