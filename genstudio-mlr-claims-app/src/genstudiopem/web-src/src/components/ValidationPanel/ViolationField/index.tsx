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
import { Violation } from "../../../types";
import { VIOLATION_STATUS } from "../../../Constants";
import ViolationFieldHeader from "./ViolationFieldHeader";
import ViolationEntry from "./ViolationEntry";

interface ViolationFieldProps {
  title: string;
  items: Violation[];
}

export default function ViolationField({ title, items }: ViolationFieldProps) {
  const issueCount = items?.filter(
    (item) => item.status === VIOLATION_STATUS.Violated
  ).length;

  const hasViolations = (v: Violation) =>
    v.status === VIOLATION_STATUS.Violated && v.violation;

  return (
    <div>
      <ViolationFieldHeader title={title} issueCount={issueCount} />
      <div style={{ paddingLeft: "0.5rem" }}>
        {issueCount > 0 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            {items.map(
              (item) =>
                hasViolations(item) && (
                  <ViolationEntry key={item.violation} item={item} />
                )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
