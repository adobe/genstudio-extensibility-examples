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

/**
 * CreateValidationPanel — mirrors the genstudio-create-validation extension.
 *
 * Behaviour:
 *   1. On mount, polls the host for available experiences (retries up to 10x).
 *   2. Fetches the GenerationContext from the host.
 *   3. User picks an experience from the dropdown.
 *   4. User clicks "Run Claims Check" → the full experience fields are shown
 *      together with any claims that were selected in the prompt dialog.
 */

import React, { useEffect, useState } from "react";
import {
  Heading,
  Text,
  Button,
  Divider,
  ProgressCircle,
} from "@react-spectrum/s2";
import {
  Experience,
  GenerationContext,
  ValidationExtensionService,
  AdditionalContext,
  SectionGenerationContext,
} from "@adobe/genstudio-extensibility-sdk";
import pRetry from "p-retry";
import { useGuestConnection } from "../../hooks";
import { EXTENSION_ID } from "../../Constants";

// ─── small layout helpers ────────────────────────────────────────────────────

const col = { display: "flex", flexDirection: "column" as const };

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  if (children === undefined || children === null) return null;
  return (
    <div style={{ ...col, gap: "0.1rem" }}>
      <Text>
        <strong>{label}</strong>
      </Text>
      <Text>{children as string}</Text>
    </div>
  );
}

function formatEntity(entity: { id: string; name?: string }): string {
  return entity.name ? `${entity.name} (${entity.id})` : entity.id;
}

// ─── GenerationContext accordion ─────────────────────────────────────────────

function AdditionalContextsSection({
  contexts,
}: {
  contexts: AdditionalContext<unknown>[];
}) {
  if (!contexts || contexts.length === 0) return null;
  return (
    <div style={{ ...col, gap: "0.5rem" }}>
      <Heading level={4}>Additional Contexts</Heading>
      {contexts.map((ctx, i) => (
        <div
          key={i}
          style={{ ...col, gap: "0.25rem", paddingLeft: "0.5rem" }}
        >
          <Field label="Extension">{ctx.extensionId}</Field>
          <Field label="Type">{ctx.additionalContextType}</Field>
          <div style={{ ...col, gap: "0.1rem" }}>
            <Text>
              <strong>Values</strong>
            </Text>
            {((ctx.additionalContextValues as unknown[]) || []).map((v, j) => (
              <Text key={j}>
                {"• "}
                {typeof v === "object" && v !== null
                  ? (v as { description?: string }).description ??
                    JSON.stringify(v)
                  : String(v)}
              </Text>
            ))}
          </div>
          {i < contexts.length - 1 && <Divider size="S" />}
        </div>
      ))}
    </div>
  );
}

function SectionsSection({
  sections,
}: {
  sections: SectionGenerationContext[];
}) {
  if (!sections || sections.length === 0) return null;
  return (
    <div style={{ ...col, gap: "0.5rem" }}>
      <Heading level={4}>Sections</Heading>
      {sections.map((section, i) => (
        <div
          key={i}
          style={{ ...col, gap: "0.25rem", paddingLeft: "0.5rem" }}
        >
          <Field label="Section ID">{section.id}</Field>
          {section.product && (
            <Field label="Product">{formatEntity(section.product)}</Field>
          )}
          {section.additionalContexts && section.additionalContexts.length > 0 && (
            <AdditionalContextsSection contexts={section.additionalContexts} />
          )}
          {i < sections.length - 1 && <Divider size="S" />}
        </div>
      ))}
    </div>
  );
}

function SourceExperienceSection({ experience }: { experience: Experience }) {
  const fields = Object.values(experience.experienceFields || {});
  return (
    <div style={{ ...col, gap: "0.5rem" }}>
      <Heading level={4}>Source Experience</Heading>
      <div style={{ ...col, gap: "0.25rem", paddingLeft: "0.5rem" }}>
        <Field label="ID">{experience.id}</Field>
        {experience.template && (
          <Field label="Template">
            {experience.template.title ?? experience.template.id}
          </Field>
        )}
        {experience.metadata?.locale && (
          <Field label="Locale">{experience.metadata.locale}</Field>
        )}
        {fields.length > 0 && (
          <div style={{ ...col, gap: "0.25rem" }}>
            <Text>
              <strong>Fields</strong>
            </Text>
            {fields.map((field) => (
              <div
                key={field.fieldName}
                style={{ ...col, gap: "0.1rem", paddingLeft: "0.5rem" }}
              >
                <Text>
                  <strong>{field.fieldName}</strong>
                </Text>
                <Text>{field.fieldValue}</Text>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function GenerationContextPanel({
  generationContext,
}: {
  generationContext: GenerationContext | null;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{
        border: "1px solid #ccc",
        borderRadius: "6px",
        overflow: "hidden",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%",
          padding: "8px 12px",
          background: "#f5f5f5",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          fontWeight: "bold",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span>Generation Context</span>
        <span>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div style={{ padding: "12px", ...col, gap: "0.75rem" }}>
          {!generationContext ? (
            <Text>No generation context available.</Text>
          ) : (
            <>
              {generationContext.userPrompt && (
                <Field label="User Prompt">
                  {generationContext.userPrompt}
                </Field>
              )}
              <Divider size="S" />
              <Field label="ID">{generationContext.id}</Field>
              <Field label="Locale">{generationContext.locale}</Field>
              {generationContext.channel && (
                <Field label="Channel">
                  {formatEntity(generationContext.channel)}
                </Field>
              )}
              {generationContext.brand && (
                <Field label="Brand">
                  {formatEntity(generationContext.brand)}
                </Field>
              )}
              {generationContext.persona && (
                <Field label="Persona">
                  {formatEntity(generationContext.persona)}
                </Field>
              )}
              {generationContext.product && (
                <Field label="Product">
                  {formatEntity(generationContext.product)}
                </Field>
              )}
              {generationContext.additionalContexts &&
                generationContext.additionalContexts.length > 0 && (
                  <>
                    <Divider size="S" />
                    <AdditionalContextsSection
                      contexts={generationContext.additionalContexts}
                    />
                  </>
                )}
              {generationContext.sections &&
                generationContext.sections.length > 0 && (
                  <>
                    <Divider size="S" />
                    <SectionsSection sections={generationContext.sections} />
                  </>
                )}
              {generationContext.sourceExperience && (
                <>
                  <Divider size="S" />
                  <SourceExperienceSection
                    experience={generationContext.sourceExperience}
                  />
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Experience fields view ───────────────────────────────────────────────────

function ExperienceContent({ experience }: { experience: Experience }) {
  const fields = Object.values(experience.experienceFields ?? {});
  return (
    <div style={{ ...col, gap: "1rem" }}>
      <Heading level={3}>Experience Details</Heading>
      <div style={{ ...col, gap: "0.5rem" }}>
        <Field label="ID">{experience.id}</Field>
        <Divider size="S" />
        <Heading level={4}>Fields</Heading>
        {fields.length === 0 && <Text>No fields available.</Text>}
        {fields.map((field) => (
          <div
            key={field.fieldName}
            style={{
              ...col,
              gap: "0.25rem",
              padding: "8px",
              background: "#f9f9f9",
              borderRadius: "4px",
              border: "1px solid #e0e0e0",
            }}
          >
            <Text>
              <strong>{field.fieldName}</strong>
            </Text>
            <Text>{field.fieldValue}</Text>
            {field.keywords && field.keywords.length > 0 && (
              <Text UNSAFE_style={{ color: "#666", fontSize: "12px" }}>
                Keywords: {field.keywords.join(", ")}
              </Text>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main panel ──────────────────────────────────────────────────────────────

export default function CreateValidationPanel({
  guestConnection: injectedConnection,
}: {
  guestConnection?: any;
} = {}): React.JSX.Element {
  // Use injected connection when rendered inline inside ValidationPanel iframe.
  // Fall back to useGuestConnection when rendered as a standalone route.
  const ownConnection = useGuestConnection(injectedConnection ? null : EXTENSION_ID);
  const guestConnection = injectedConnection ?? ownConnection;

  const [experiences, setExperiences] = useState<Experience[] | null>(null);
  const [generationContext, setGenerationContext] =
    useState<GenerationContext | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [checkedExperience, setCheckedExperience] =
    useState<Experience | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const syncExperiences = async (): Promise<Experience[] | null> => {
    if (!guestConnection) return null;
    setSyncError(null);
    const remote = await ValidationExtensionService.getExperiences(guestConnection);
    if (remote && remote.length > 0) {
      setExperiences(remote);
      return remote;
    }
    return null;
  };

  const fetchGenerationContext = async () => {
    if (!guestConnection) return;
    const ctx = await ValidationExtensionService.getGenerationContext(guestConnection);
    setGenerationContext(ctx);
  };

  useEffect(() => {
    if (!guestConnection) return;

    setIsLoading(true);

    const poll = async () => {
      try {
        await pRetry(
          async () => {
            const result = await syncExperiences();
            if (!result) throw new Error("No experiences yet");
          },
          { retries: 10, minTimeout: 2000, maxTimeout: 2000 },
        );
      } catch {
        setSyncError(
          "Could not load experiences after several attempts. Click Sync to retry.",
        );
      }
    };

    poll().finally(() => setIsLoading(false));
    fetchGenerationContext().catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guestConnection]);

  const handleRunClaimsCheck = () => {
    if (experiences !== null && selectedIndex !== null) {
      setCheckedExperience(experiences[selectedIndex]);
    }
  };

  const handleSync = async () => {
    setIsLoading(true);
    try {
      await Promise.all([syncExperiences(), fetchGenerationContext()]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      data-testid="create-validation-panel"
      style={{ backgroundColor: "white", minHeight: "100vh", padding: "0" }}
    >
      {/* ── Header ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 16px 8px",
        }}
      >
        <Heading>Experiences</Heading>
        <Button
          variant="secondary"
          onPress={handleSync}
          isDisabled={isLoading}
          data-testid="create-validation-sync-button"
        >
          Sync
        </Button>
      </div>
      <Divider size="S" />

      {/* ── Loading ── */}
      {isLoading && (
        <div
          data-testid="create-validation-loading"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "16px",
          }}
        >
          <ProgressCircle size="S" isIndeterminate />
          <Text>Loading experiences...</Text>
        </div>
      )}

      {/* ── Error ── */}
      {syncError && (
        <div style={{ padding: "16px" }}>
          <Text UNSAFE_style={{ color: "#C9252D" }}>{syncError}</Text>
        </div>
      )}

      {/* ── Experience Selector ── */}
      {experiences !== null && (
        <div style={{ padding: "16px", ...col, gap: "12px" }}>
          <Heading level={3}>Claims Libraries</Heading>

          <label
            htmlFor="experience-select"
            style={{ display: "block", marginBottom: "4px", fontWeight: 600, fontSize: "14px" }}
          >
            Select Experience to Run Claims Check
          </label>
          <select
            id="experience-select"
            data-testid="create-validation-experience-picker"
            value={selectedIndex ?? ""}
            onChange={(e) => {
              const idx = Number(e.target.value);
              setSelectedIndex(idx);
              setCheckedExperience(null);
            }}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              fontSize: "14px",
            }}
          >
            <option value="" disabled>
              — choose an experience —
            </option>
            {experiences.map((exp, idx) => (
              <option key={exp.id} value={idx}>
                {`Experience ${idx + 1}`}
              </option>
            ))}
          </select>

          {selectedIndex !== null && (
            <Button
              variant="primary"
              onPress={handleRunClaimsCheck}
              data-testid="create-validation-run-button"
            >
              Run Claims Check
            </Button>
          )}
        </div>
      )}

      {/* ── Generation Context ── */}
      <div style={{ padding: "0 16px 16px" }}>
        <GenerationContextPanel generationContext={generationContext} />
      </div>

      {/* ── Experience Fields (after Run Claims Check) ── */}
      {checkedExperience && (
        <>
          <Divider size="S" />
          <div style={{ padding: "16px" }}>
            <ExperienceContent experience={checkedExperience} />
          </div>
        </>
      )}
    </div>
  );
}
