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
import { Heading } from "@react-spectrum/s2";
import { ClaimResults } from "../../../types";
import { convertSnakeCaseToCamelCase } from "../../../utils/stringUtils";
import ViolationField from "../ViolationField";
import { style } from "@react-spectrum/s2/style" with {type: 'macro'};

interface PodProps {
  podNumber: string;
  violations: ClaimResults;
}

export default function Pod({ podNumber, violations }: PodProps) {
  return (
    <div>
      {podNumber !== "0" && (
        <p className={style({ font: "title" })}>Section {podNumber}</p>
      )}
      {Object.keys(violations).map((fieldName) => (
        <div key={podNumber + fieldName}>
          <ViolationField
            title={convertSnakeCaseToCamelCase(fieldName)}
            items={violations[fieldName]}
          />
        </div>
      ))}
    </div>
  );
}
