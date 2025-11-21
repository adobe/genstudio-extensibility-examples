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
import { Heading, Text, Divider } from "@react-spectrum/s2";
import { Experience } from "@adobe/genstudio-extensibility-sdk";

interface ContentProps {
  experience: Experience;
}

/**
 * Content component that displays the details of an experience.
 * @param experience - The experience to display
 * @returns The Content component
 */
export default function Content({ experience }: ContentProps) {
  if (!experience) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <Heading>Experience Details</Heading>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <Text>ID: {experience.id}</Text>
        <Divider size="S" />
        <Heading>Fields</Heading>
        {Object.entries(experience.experienceFields).map(([key, field]) => (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}
            key={key}
          >
            <Text>
              <strong>{field.fieldName}</strong>
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
          </div>
        ))}
      </div>
    </div>
  );
}
