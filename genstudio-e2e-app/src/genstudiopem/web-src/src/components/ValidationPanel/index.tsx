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

import React, { useEffect, useRef, useState } from "react";
import { Heading, Text, Button, ProgressCircle } from "@react-spectrum/s2";
import { useGuestConnection, useAuth } from "../../hooks";
import { APP_METADATA, EXTENSION_ID } from "../../Constants";
import CreateValidationPanel from "../CreateValidationPanel";
import {
  ValidationExtensionService,
  Experience,
  GenerationContext,
  AdditionalContextTypes,
} from "@adobe/genstudio-extensibility-sdk";
import pRetry from "p-retry";
import {
  readSelectedExperience,
  subscribeToSelectedExperience,
  readValidationPanelMode,
  subscribeToValidationPanelMode,
} from "../../utils/validationBridge";

type ValidationStatus = "No issues" | "Needs review";
type ValidationItem = {
  section: "Subject" | "Head" | "Subhead" | "Content" | "Btn";
  status: ValidationStatus;
  reason?: string;
};

const VALIDATION_SECTIONS: ValidationItem["section"][] = [
  "Subject",
  "Head",
  "Subhead",
  "Content",
  "Btn",
];

type ClaimContextValue = {
  id: string;
  description: string;
};

const MAX_CHARACTER_LIMITS: Record<string, number> = {
  header: 80,
  pre_header: 100,
  body: 300,
  default: 500,
};

function extractClaimDescriptions(context: GenerationContext | null): string[] {
  if (!context) {
    return [];
  }

  const topLevelClaims = (context.additionalContexts || [])
    .filter((item) => item.additionalContextType === AdditionalContextTypes.Claims)
    .flatMap((item) => item.additionalContextValues || [])
    .map((item) => (item as ClaimContextValue).description)
    .filter(Boolean);

  const sectionClaims = (context.sections || [])
    .flatMap((section) => section.additionalContexts || [])
    .filter((item) => item.additionalContextType === AdditionalContextTypes.Claims)
    .flatMap((item) => item.additionalContextValues || [])
    .map((item) => (item as ClaimContextValue).description)
    .filter(Boolean);

  return [...new Set([...topLevelClaims, ...sectionClaims])];
}

function extractPercentages(values: string[]): string[] {
  return values.flatMap((value) => Array.from(value.matchAll(/\b\d+(?:\.\d+)?%/g), (match) => match[0]));
}

function normalizeForClaimMatch(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[,.!?;:]/g, "");
}

function hasClaimViolation(fieldValue: string, claimDescription: string): boolean {
  const normalizedText = normalizeForClaimMatch(fieldValue);
  const normalizedClaim = normalizeForClaimMatch(claimDescription);

  if (normalizedText.includes(normalizedClaim)) {
    return false;
  }

  const textWithoutNumbers = normalizedText.replace(/[0-9]/g, "");
  const claimWithoutNumbers = normalizedClaim.replace(/[0-9]/g, "");
  return textWithoutNumbers.includes(claimWithoutNumbers);
}

function getCharacterLimit(fieldName: string): number {
  const withoutPodPrefix = fieldName.replace(/^pod\d+_/, "").toLowerCase();
  return MAX_CHARACTER_LIMITS[withoutPodPrefix] || MAX_CHARACTER_LIMITS.default;
}

function classifySection(fieldName: string): ValidationItem["section"] {
  const normalizedName = fieldName.toLowerCase();

  if (normalizedName.includes("subject")) return "Subject";
  if (normalizedName.includes("subhead") || normalizedName.includes("preheader")) return "Subhead";
  if (normalizedName.includes("headline") || normalizedName === "head" || normalizedName.includes("head")) return "Head";
  if (normalizedName.includes("button") || normalizedName.includes("cta") || normalizedName === "btn") return "Btn";
  return "Content";
}

function createValidationItems(experience: Experience | null, claimDescriptions: string[], mode: "single" | "overall"): ValidationItem[] {
  if (!experience) {
    return [];
  }

  const claimPercentages = extractPercentages(claimDescriptions);
  const fieldValuesBySection = Object.values(experience.experienceFields || {}).reduce<
    Record<ValidationItem["section"], Array<{ fieldName: string; fieldValue: string }>>
  >(
    (accumulator, field) => {
      const section = classifySection(field.fieldName);
      accumulator[section].push({
        fieldName: field.fieldName,
        fieldValue: field.fieldValue || "",
      });
      return accumulator;
    },
    {
      Subject: [],
      Head: [],
      Subhead: [],
      Content: [],
      Btn: [],
    },
  );

  return VALIDATION_SECTIONS.map((section) => {
    const sectionFields = fieldValuesBySection[section];
    const fieldValues = sectionFields.map((item) => item.fieldValue);
    const fieldPercentages = extractPercentages(fieldValues);
    const isContentSection = section === "Content";
    const sectionReasons: string[] = [];

    if (!sectionFields.length) {
      return {
        section,
        status: "No issues",
        reason: "No editable content in this section.",
      };
    }

    const hasNumericMismatch =
      mode === "single" &&
      isContentSection &&
      claimPercentages.length > 0 &&
      fieldPercentages.length > 0 &&
      fieldPercentages.some((percentage) => !claimPercentages.includes(percentage));

    if (hasNumericMismatch) {
      sectionReasons.push(
        `Numeric value mismatch. Claims allow ${claimPercentages.join(", ")}, but content uses ${fieldPercentages.join(", ")}.`,
      );
    }

    if (mode === "single") {
      sectionFields.forEach(({ fieldName, fieldValue }) => {
        const limit = getCharacterLimit(fieldName);
        if (fieldValue.length > limit) {
          sectionReasons.push(
            `Max character limit for ${fieldName} is ${limit}.`,
          );
        }

        claimDescriptions.forEach((claimDescription) => {
          if (hasClaimViolation(fieldValue, claimDescription)) {
            sectionReasons.push(`Violated claim: ${claimDescription}`);
          }
        });
      });
    }

    if (sectionReasons.length > 0) {
      return {
        section,
        status: "Needs review",
        reason: sectionReasons[0],
      };
    }

    return {
      section,
      status: "No issues",
      reason: claimDescriptions.length
        ? isContentSection
          ? "Content values align with selected claims."
          : "Section not checked for numeric claim mismatch."
        : "No claim context selected for this run.",
    };
  });
}

/**
 * Root export — switches between MLR validation and create-validation views
 * using the mode bridge (localStorage + CustomEvent) so both panels share
 * the single registered extension iframe.
 */
export default function ValidationPanel(): React.JSX.Element {
  const [panelMode, setPanelMode] = useState<string>(readValidationPanelMode());

  useEffect(() => {
    return subscribeToValidationPanelMode(setPanelMode);
  }, []);

  const guestConnection = useGuestConnection(EXTENSION_ID);

  if (panelMode === "create-validation") {
    return <CreateValidationPanel guestConnection={guestConnection} />;
  }
  return <MLRValidationPanel guestConnection={guestConnection} />;
}

function MLRValidationPanel({ guestConnection }: { guestConnection: any }): React.JSX.Element {
  const auth = useAuth(guestConnection);
  const [experiences, setExperiences] = useState<Experience[] | null>(null);
  const [generationContext, setGenerationContext] = useState<GenerationContext | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const singleExperienceMode = Boolean(
    APP_METADATA.options?.validation?.singleExperienceViewMode,
  );
  const autoRefreshEnabled = Boolean(
    APP_METADATA.options?.validation?.autoRefreshApp,
  );
  const [activeTab, setActiveTab] = useState<"single" | "overall">(
    singleExperienceMode ? "single" : "overall",
  );
  const [validationItems, setValidationItems] = useState<ValidationItem[]>([]);
  const [hasRunValidation, setHasRunValidation] = useState(false);
  const [isStale, setIsStale] = useState(false);
  const [selectedExperienceId, setSelectedExperienceId] = useState<string | null>(
    readSelectedExperience()?.experienceId || null,
  );
  // Ref to access latest hasRunValidation inside async callbacks without stale closure
  const hasRunValidationRef = useRef(false);

  const activeExperience =
    experiences?.find((experience) => experience.id === selectedExperienceId) ||
    experiences?.[0] ||
    null;
  const activeExperienceIndex = experiences?.findIndex(
    (experience) => experience.id === activeExperience?.id,
  ) ?? -1;
  const claimDescriptions = extractClaimDescriptions(generationContext);
  const issueCount = validationItems.filter((item) => item.status === "Needs review").length;
  const summaryTitle = issueCount === 0 ? "No issues" : `${issueCount} issue${issueCount > 1 ? "s" : ""}`;
  const summaryBody =
    issueCount === 0
      ? `No issues found on Variant ${activeExperienceIndex + 1}`
      : `Found ${issueCount} potential issue${issueCount > 1 ? "s" : ""} on Variant ${activeExperienceIndex + 1}`;

  const refreshHostData = async () => {
    if (!guestConnection) return;

    setIsLoading(true);
    try {
      const [remoteExperiences, remoteGenerationContext] = await Promise.all([
        pRetry(
          async () => {
            const fetchedExperiences = await ValidationExtensionService.getExperiences(guestConnection);
            if (!fetchedExperiences || fetchedExperiences.length === 0) {
              throw new Error("No experiences yet");
            }
            return fetchedExperiences;
          },
          {
            retries: 10,
            minTimeout: 1000,
            maxTimeout: 1000,
          },
        ),
        ValidationExtensionService.getGenerationContext(guestConnection),
      ]);

      const nextActiveExperienceId =
        selectedExperienceId && remoteExperiences.some((item) => item.id === selectedExperienceId)
          ? selectedExperienceId
          : remoteGenerationContext?.sourceExperience?.id || remoteExperiences[0]?.id || null;

      setExperiences(remoteExperiences);
      setGenerationContext(remoteGenerationContext);
      setSelectedExperienceId(nextActiveExperienceId);

      return {
        experiences: remoteExperiences,
        generationContext: remoteGenerationContext,
        activeExperience:
          remoteExperiences.find((item) => item.id === nextActiveExperienceId) ||
          remoteExperiences[0] ||
          null,
      };
    } catch (e) {
      console.error("[e2e] Failed to fetch validation host data:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const runValidation = (
    experienceOverride?: Experience | null,
    claimsOverride?: string[],
  ) => {
    setValidationItems(
      createValidationItems(
        experienceOverride ?? activeExperience,
        claimsOverride ?? claimDescriptions,
        activeTab,
      ),
    );
    setHasRunValidation(true);
    hasRunValidationRef.current = true;
    setIsStale(false);
  };

  // Re-run with existing data only when the tab (single/overall) changes
  useEffect(() => {
    if (hasRunValidation) {
      runValidation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // When host selects a new variant: clear stale results immediately, then fetch
  // fresh data and auto-rerun — matching the real validation add-on behavior.
  useEffect(() => {
    return subscribeToSelectedExperience(({ experienceId }) => {
      setSelectedExperienceId(experienceId);

      if (!hasRunValidationRef.current) return;

      // Immediately clear so the user never sees a previous variant's results
      setValidationItems([]);
      setIsStale(true);
    });
  }, []);

  // When selectedExperienceId changes after validation has been run: fetch
  // fresh experiences from the host and re-run for the newly selected variant.
  useEffect(() => {
    if (!selectedExperienceId || !guestConnection) return;
    if (!hasRunValidationRef.current) return;

    refreshHostData()
      .then((freshData) => {
        if (!freshData) return;
        const targetExperience =
          freshData.experiences.find((e) => e.id === selectedExperienceId) ||
          freshData.activeExperience;
        runValidation(
          targetExperience,
          extractClaimDescriptions(freshData.generationContext),
        );
      })
      .catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedExperienceId, guestConnection]);

  useEffect(() => {
    if (guestConnection && auth) {
      refreshHostData()
        .then((hostData) => {
          if (!autoRefreshEnabled || !hostData) return;
          runValidation(
            hostData.activeExperience,
            extractClaimDescriptions(hostData.generationContext),
          );
        })
        .catch(console.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guestConnection, auth, autoRefreshEnabled]);

  return (
    <div data-testid="validation-panel" style={{ padding: "24px" }}>
      <Heading>Validation Panel (E2E)</Heading>
      <Text UNSAFE_style={{ marginBottom: "16px" }}>
        {auth
          ? "Connected to host. Ready to validate experiences."
          : "Connecting to host..."}
      </Text>
      {isLoading && (
        <div data-testid="validation-loading" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <ProgressCircle size="S" isIndeterminate />
          <Text>Loading experiences...</Text>
        </div>
      )}
      {experiences && (
        <div data-testid="experience-list">
          <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
            <Button
              data-testid="validation-tab-single"
              variant={activeTab === "single" ? "primary" : "secondary"}
              onPress={() => setActiveTab("single")}
            >
              Single View
            </Button>
            <Button
              data-testid="validation-tab-overall"
              variant={activeTab === "overall" ? "primary" : "secondary"}
              onPress={() => setActiveTab("overall")}
            >
              Overall View
            </Button>
          </div>

          <Text data-testid="active-experience-label" UNSAFE_style={{ marginBottom: "12px", display: "block" }}>
            Email {activeExperienceIndex + 1} of {experiences.length}
          </Text>

          <div
            data-testid="validation-summary-card"
            style={{
              padding: "12px",
              marginBottom: "12px",
              border: isStale ? "1px solid #E68619" : issueCount === 0 ? "1px solid #1B9A59" : "1px solid #C9252D",
              borderRadius: "8px",
              backgroundColor: "#F9FBFA",
            }}
          >
            <Heading level={4} data-testid="validation-summary-title">
              {isStale ? "Re-run checks" : hasRunValidation ? summaryTitle : "Ready to validate"}
            </Heading>
            <Text data-testid="validation-summary-body">
              {isStale
                ? "Content changed since the last check. Run checks again to get up-to-date results."
                : hasRunValidation
                ? summaryBody
                : "Run checks to evaluate the selected experience."}
            </Text>
          </div>

          <Text data-testid="validation-claims-count" UNSAFE_style={{ marginBottom: "12px", display: "block" }}>
            Selected claims from host: {claimDescriptions.length}
          </Text>

          {experiences.map((exp) => (
            <div
              key={exp.id}
              data-testid={`experience-item-${exp.id}`}
              style={{
                padding: "8px",
                marginBottom: "8px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                backgroundColor:
                  activeExperience?.id === exp.id ? "#F5F8FF" : "#FFFFFF",
              }}
            >
              <Text>{exp.id}</Text>
            </div>
          ))}

          {hasRunValidation && validationItems.length > 0 && (
            <div data-testid="validation-result-list" style={{ marginTop: "12px" }}>
              {validationItems.map((item) => (
                <div
                  key={item.section}
                  data-testid={`validation-result-${item.section.toLowerCase()}`}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 0",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  <Text>{item.section}</Text>
                  <Text
                    UNSAFE_style={{
                      color: item.status === "No issues" ? "#1B9A59" : "#C9252D",
                      fontWeight: "bold",
                    }}
                  >
                    {item.status}
                  </Text>
                </div>
              ))}
            </div>
          )}

          {!autoRefreshEnabled && (
            <Button
              data-testid="run-validation-button"
              variant="primary"
              UNSAFE_style={{ marginTop: "16px" }}
              onPress={async () => {
                const hostData = await refreshHostData();
                runValidation(
                  hostData?.activeExperience,
                  extractClaimDescriptions(hostData?.generationContext || null),
                );
              }}
              isDisabled={!activeExperience}
            >
              Run Validation Check
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
