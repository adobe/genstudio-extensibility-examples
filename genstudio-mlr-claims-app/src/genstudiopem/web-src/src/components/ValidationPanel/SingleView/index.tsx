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
import { Divider } from "@react-spectrum/s2";
import { Violation, ClaimResults } from "../../../types";
import { APP_METADATA, VIOLATION_STATUS } from "../../../Constants";
import { extractPodNumber, removePodPrefix } from "../../../utils/stringUtils";
import AlertMessage from "./AlertMessage";
import Pod from "./Pod";
import ExperienceSelector from "./ExperienceSelector";

interface ResultProps {
  claims: ClaimResults[]; // or define a more specific type
  experienceNumber: number;
}

export default function Result({ claims, experienceNumber }: ResultProps) {
  // Count total issues
  const totalIssues = Object.values(claims[experienceNumber])
    .flat()
    .filter(
      (violation: Violation) => violation.status === VIOLATION_STATUS.Violated
    ).length;

  // Group violations by pod and field
  const violationsByPodAndField: Record<string, ClaimResults> = {};
  for (const rawField of Object.keys(claims[experienceNumber])) {
    const field = removePodPrefix(rawField);
    const pod = extractPodNumber(rawField);
    if (!violationsByPodAndField[pod]) violationsByPodAndField[pod] = {};
    violationsByPodAndField[pod][field] = claims[experienceNumber][rawField];
  }

  const podNumbers = Object.keys(violationsByPodAndField);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <AlertMessage
        totalIssues={totalIssues}
        experienceNumber={experienceNumber}
      />
      {podNumbers.map((podNumber, index) => (
        <React.Fragment key={podNumber}>
          <Pod
            podNumber={podNumber}
            violations={violationsByPodAndField[podNumber]}
          />
          {index < podNumbers.length - 1 && (
            <div style={{ marginLeft: "2rem", marginRight: "2rem" }}>
              <Divider size="S" />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
