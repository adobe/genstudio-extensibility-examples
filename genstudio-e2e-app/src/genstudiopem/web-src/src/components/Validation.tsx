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
import {
  Button,
  ButtonGroup,
  Divider,
  Heading,
  Text,
} from "@react-spectrum/s2";
import {
  Experience,
  GenerationContext,
  ValidationExtensionService,
} from "@adobe/genstudio-extensibility-sdk";
import { useGuestConnection } from "../hooks";
import { EXTENSION_ID } from "../Constants";

const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 10;

export default function Validation(): React.JSX.Element {
  const guestConnection = useGuestConnection(EXTENSION_ID);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [generationContext, setGenerationContext] =
    useState<GenerationContext | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExperiences = async (): Promise<Experience[]> => {
    if (!guestConnection) return [];
    const remote =
      await ValidationExtensionService.getExperiences(guestConnection);
    if (remote && remote.length > 0) {
      setExperiences(remote);
      return remote;
    }
    return [];
  };

  const fetchGenerationContext = async (): Promise<void> => {
    if (!guestConnection) return;
    try {
      const ctx =
        await ValidationExtensionService.getGenerationContext(guestConnection);
      setGenerationContext(ctx);
    } catch (e) {
      console.error("Failed to fetch generation context", e);
    }
  };

  useEffect(() => {
    if (!guestConnection) return;
    let cancelled = false;
    let attempts = 0;

    const poll = async (): Promise<void> => {
      try {
        const result = await fetchExperiences();
        if (cancelled) return;
        if (result.length === 0 && attempts < MAX_POLL_ATTEMPTS) {
          attempts += 1;
          setTimeout(poll, POLL_INTERVAL_MS);
          return;
        }
        if (result.length === 0) {
          setError("No experiences available from host.");
        }
        setIsLoading(false);
      } catch (e) {
        console.error("Failed to fetch experiences", e);
        if (!cancelled) {
          setError("Failed to fetch experiences from host.");
          setIsLoading(false);
        }
      }
    };

    setIsLoading(true);
    poll();
    fetchGenerationContext();

    return () => {
      cancelled = true;
    };
  }, [guestConnection]);

  const selectedExperience =
    selectedIndex === null ? null : experiences[selectedIndex] ?? null;

  if (isLoading) {
    return (
      <div data-testid="validation-loading" style={{ padding: 24 }}>
        <Text>Loading experiences...</Text>
      </div>
    );
  }

  return (
    <div
      data-testid="validation-panel"
      style={{
        backgroundColor: "white",
        minHeight: "100vh",
        padding: 24,
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Heading level={3}>Validation Panel (E2E)</Heading>
        <Button
          data-testid="validation-sync-button"
          variant="secondary"
          onPress={() => {
            fetchExperiences().catch(console.error);
          }}
        >
          Sync
        </Button>
      </div>

      {error && (
        <Text data-testid="validation-error" UNSAFE_style={{ color: "#C9252D" }}>
          {error}
        </Text>
      )}

      <div data-testid="validation-context">
        <Heading level={4}>Generation Context</Heading>
        <Text data-testid="validation-context-channel">
          channel: {generationContext?.channel?.id || ""}
        </Text>
        <Text data-testid="validation-context-brand">
          brand: {generationContext?.brand?.id || ""}
        </Text>
        <Text data-testid="validation-context-product">
          product: {generationContext?.product?.id || ""}
        </Text>
        <Text data-testid="validation-context-prompt">
          prompt: {generationContext?.userPrompt || ""}
        </Text>
      </div>

      <Divider size="S" />

      <div data-testid="experience-list">
        <Heading level={4}>Experiences ({experiences.length})</Heading>
        <ButtonGroup>
          {experiences.map((exp, index) => (
            <Button
              key={exp.id}
              data-testid={`experience-button-${exp.id}`}
              variant={selectedIndex === index ? "accent" : "secondary"}
              onPress={() => setSelectedIndex(index)}
            >
              {exp.id}
            </Button>
          ))}
        </ButtonGroup>
      </div>

      {selectedExperience && (
        <div data-testid="experience-content">
          <Divider size="S" />
          <Heading level={4}>Selected: {selectedExperience.id}</Heading>
          {Object.entries(selectedExperience.experienceFields || {}).map(
            ([key, field]) => (
              <div
                key={key}
                data-testid={`experience-field-${key}`}
                style={{ marginBottom: 8 }}
              >
                <Text UNSAFE_style={{ fontWeight: 600 }}>
                  {field.fieldName}
                </Text>
                <Text>{field.fieldValue}</Text>
              </div>
            ),
          )}
        </div>
      )}
    </div>
  );
}
