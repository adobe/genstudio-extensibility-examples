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
import { Badge, Heading } from "@react-spectrum/s2";
import { Experience } from "@adobe/genstudio-extensibility-sdk";
import { ClaimResults } from "../../../types";
import { Violation } from "../../../types";
import { VIOLATION_STATUS } from "../../../Constants";
import { style } from "@react-spectrum/s2/style" with {type: 'macro'};

interface ExperienceListItemProps {
  experience: Experience;
  experienceNumber: number;
  claimResults: ClaimResults | null;
}

export default function ExperienceListItem({
  experience,
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

  const hasIssues = totalIssues > 0;

  return (
    <div>
      <div>
        <p className={style({ font: "title-sm", margin: 4 })}>Email {experienceNumber + 1}</p>
      </div>
      <div>
        {hasIssues ? (
          <Badge variant="negative">
            {totalIssues} issue{totalIssues > 1 ? "s" : ""}
          </Badge>
        ) : (
          <Badge variant="positive">No issues</Badge>
        )}
      </div>
    </div>
  );
}
