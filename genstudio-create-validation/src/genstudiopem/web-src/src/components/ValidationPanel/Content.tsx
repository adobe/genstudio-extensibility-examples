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

import React from "react";
import { Button, Heading, Text, Divider } from "@react-spectrum/s2";
import { Experience } from "@adobe/genstudio-extensibility-sdk";

interface ContentProps {
  experience: Experience;
  flaggedFieldName?: string;
  onApplySuggestion?: (fieldName: string) => void;
}

/**
 * Content component that displays the details of an experience.
 * @param experience - The experience to display
 * @param flaggedFieldName - The field name that has been flagged
 * @param onApplySuggestion - Callback to apply the suggestion for a flagged field
 * @returns The Content component
 */
export default function Content({ experience, flaggedFieldName, onApplySuggestion }: ContentProps) {
  if (!experience) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <Heading>Experience Details</Heading>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <Text>ID: {experience.id}</Text>
        <Divider size="S" />
        <Heading>Fields</Heading>
        {Object.entries(experience.experienceFields).map(([key, field]) => {
          const isFlagged = field.fieldName === flaggedFieldName;
          return (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.25rem",
                padding: isFlagged ? "0.5rem" : undefined,
                border: isFlagged ? "1px solid #e04a0e" : undefined,
                borderRadius: isFlagged ? "4px" : undefined,
                backgroundColor: isFlagged ? "#fff3f0" : undefined,
              }}
              key={key}
            >
              <Text>
                <strong>{field.fieldName}</strong>
                {isFlagged && (
                  <span style={{ color: "#e04a0e", marginLeft: "0.5rem" }}>
                    ⚠ Needs review
                  </span>
                )}
              </Text>
              <Text>{field.fieldValue}</Text>
              {field.keywords && (
                <Text>keywords: {field.keywords.join(", ")}</Text>
              )}
              {field.additionalMetadata && (
                <Text>
                  additionalMetadata: {JSON.stringify(field.additionalMetadata)}
                </Text>
              )}
              {isFlagged && onApplySuggestion && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", marginTop: "0.25rem" }}>
                  <Text>
                    <em>Suggestion: "This is a suggested field value from the Validation App!"</em>
                  </Text>
                  <Button
                    variant="accent"
                    size="S"
                    onPress={() => onApplySuggestion(field.fieldName)}
                  >
                    Apply suggestion
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
