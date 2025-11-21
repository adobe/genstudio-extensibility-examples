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
import { Badge } from "@react-spectrum/s2";
import { style } from "@react-spectrum/s2/style" with {type: 'macro'};

interface ViolationFieldHeaderProps {
  title: string;
  issueCount: number;
}

export default function ViolationFieldHeader({
  title,
  issueCount,
}: ViolationFieldHeaderProps) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <p
        className={style({ font: "title-sm" })}
      >
        {title}
      </p>
      {issueCount > 0 ? (
        <Badge variant="negative">
          {issueCount} issue{issueCount > 1 ? "s" : ""}
        </Badge>
      ) : (
        <Badge variant="positive">No issues</Badge>
      )}
    </div>
  );
}
