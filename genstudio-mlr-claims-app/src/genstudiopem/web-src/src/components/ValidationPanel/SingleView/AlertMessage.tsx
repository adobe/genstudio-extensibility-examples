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
import { InlineAlert, Heading, Content } from "@react-spectrum/s2";
import { convertNumberToWords } from "../../../utils/stringUtils";

interface AlertMessageProps {
  totalIssues: number;
  experienceNumber: number;
}

export default function AlertMessage({
  totalIssues,
  experienceNumber,
}: AlertMessageProps) {
  const emailNumber = experienceNumber + 1;
  let message = "";

  if (totalIssues === 0) {
    message = `No issues found on Email ${emailNumber}`;
  } else {
    const numIssues = convertNumberToWords(totalIssues);
    message = `${numIssues} issue${totalIssues === 1 ? "" : "s"} need${
      totalIssues === 1 ? "s" : ""
    } attention on Email ${emailNumber}`;
  }

  return (
    <InlineAlert variant={totalIssues === 0 ? "positive" : "negative"}>
      <Heading>{totalIssues === 0 ? "No issues" : "Issues found"}</Heading>
      <Content>{message}</Content>
    </InlineAlert>
  );
}
