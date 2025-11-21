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
import { Text, Button } from "@react-spectrum/s2";
import { Violation } from "../../../types";
import { copyToClipboard } from "../../../utils/copyToClipboard";
import { CLAIM_VIOLATION_PREFIX } from "../../../Constants";
import { style } from "@react-spectrum/s2/style" with {type: 'macro'};

interface ViolationEntryProps {
  item: Violation;
}

export default function ViolationEntry({ item }: ViolationEntryProps) {
  const handleCopyPress = (violation: string) =>
    copyToClipboard(violation.split("Violated claim:")[1].trim());

  return (
    <div key={item.violation}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2rem auto auto",
          gap: "0.5rem",
          alignItems: "start",
        }}
      >
        <span
          style={{ color: "var(--spectrum-orange-900)", fontSize: "1.25rem" }}
        >
          ⚠️
        </span>
        <p className={style({ font: "body-sm" })}>{item.violation}</p>
        {item.violation!.includes(CLAIM_VIOLATION_PREFIX) && (
          <Button
            variant="secondary"
            size="S"
            onPress={() => handleCopyPress(item.violation!)}
          >
            Copy
          </Button>
        )}
      </div>
    </div>
  );
}
