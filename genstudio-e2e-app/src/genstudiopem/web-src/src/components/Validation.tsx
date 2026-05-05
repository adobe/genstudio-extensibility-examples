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
  GenerationContext,
  ValidationExtensionService,
} from "@adobe/genstudio-extensibility-sdk";
import { useGuestConnection } from "../hooks";
import { EXTENSION_ID } from "../Constants";

const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 10;

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

export default function Validation(): React.JSX.Element {
  const guestConnection = useGuestConnection(EXTENSION_ID);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [generationContext, setGenerationContext] = useState<GenerationContext | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<FieldUpdate | null>(null);

  useEffect(() => {
    if (!guestConnection) return;
    let cancelled = false;
    let attempts = 0;

    const poll = async () => {
      const result = await ValidationExtensionService.getExperiences(guestConnection);
      if (cancelled) return;
      if (result && result.length > 0) {
        setExperiences(result);
        setIsLoading(false);
      } else if (attempts < MAX_POLL_ATTEMPTS) {
        attempts += 1;
        setTimeout(poll, POLL_INTERVAL_MS);
      } else {
        setIsLoading(false);
      }
    };

    poll().catch(console.error);
    ValidationExtensionService.getGenerationContext(guestConnection)
      .then((ctx) => setGenerationContext(ctx))
      .catch(console.error);

    return () => { cancelled = true; };
  }, [guestConnection]);

  if (isLoading) {
    return (
      <div data-testid="validation-loading" style={{ padding: 24 }}>
        Loading experiences...
      </div>
    );
  }

  return (
    <div data-testid="validation-panel" style={{ padding: 24 }}>
      <Heading>Validation Panel (E2E)</Heading>

      <Heading level={4}>Generation Context</Heading>
      <div data-testid="generation-context-box" style={jsonBoxStyle}>
        {JSON.stringify(generationContext, null, 2)}
      </div>

      <Heading level={4}>Experiences ({experiences.length})</Heading>
      <div data-testid="experiences-box" style={jsonBoxStyle}>
        {JSON.stringify(experiences, null, 2)}
      </div>

      <Heading level={4}>Update Field</Heading>
      <button
        type="button"
        data-testid="update-field-submit"
        disabled={experiences.length === 0}
        onClick={() => {
          if (!guestConnection || experiences.length === 0) return;
          const update: FieldUpdate = {
            experienceId: experiences[0].id,
            name: "subject",
            value: "E2E Updated Subject",
          };
          ValidationExtensionService.updateField(guestConnection, update);
          setLastUpdate(update);
        }}
        style={{
          marginTop: "8px",
          padding: "8px 24px",
          background: "#1473E6",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "14px",
        }}
      >
        Update Subject
      </button>

      {lastUpdate && (
        <div data-testid="last-update-box" style={jsonBoxStyle}>
          {JSON.stringify(lastUpdate, null, 2)}
        </div>
      )}
    </div>
  );
}
