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
import { Experience } from "@adobe/genstudio-extensibility-sdk";
import { ClaimResults } from "../../../types";
import ExperienceListItem from "./ExperienceListItem";

interface OverallViewProps {
  experiences: Experience[];
  claimsResults: ClaimResults[] | null;
}

export default function OverallView({
  experiences,
  claimsResults,
}: OverallViewProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {experiences.map((experience, index) => (
          <ExperienceListItem
            key={experience.id}
            experience={experience}
            experienceNumber={index}
            claimResults={claimsResults ? claimsResults[index] : null}
          />
        ))}
      </div>
    </div>
  );
}
