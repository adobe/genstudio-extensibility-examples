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
import { ClaimResults } from "../../../types";
import { Violation } from "../../../types";
import { VIOLATION_STATUS } from "../../../Constants";
import ViolationFieldHeader from "../ViolationField/ViolationFieldHeader";
import ViolationEntry from "../ViolationField/ViolationEntry";

interface ExperienceListItemProps {
  experienceNumber: number;
  claimResults: ClaimResults | null;
}

export default function ExperienceListItem({
  experienceNumber,
  claimResults,
}: ExperienceListItemProps) {
  // Count total issues for this experience
  const totalIssues = claimResults
    ? Object.values(claimResults)
        .flat()
        .filter(
          (violation: Violation) =>
            violation.status === VIOLATION_STATUS.Violated
        ).length
    : 0;

  // Get all violations with their field names
  const violationEntries = claimResults
    ? Object.entries(claimResults).flatMap(([fieldName, violations]) =>
        violations
          .filter((v) => v.status === VIOLATION_STATUS.Violated)
          .map((violation) => ({
            fieldName,
            violation: {
              status: violation.status,
              violation: `${fieldName} - ${violation.violation}`,
            },
          }))
      )
    : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <ViolationFieldHeader
        title={`Email ${experienceNumber + 1}`}
        issueCount={totalIssues}
      />
      {violationEntries.length > 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            paddingLeft: "1rem",
          }}
        >
          {violationEntries.map((entry, index) => (
            <ViolationEntry
              key={`${entry.fieldName}-${index}`}
              item={entry.violation}
            />
          ))}
        </div>
      )}
    </div>
  );
}
