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
import { Tabs, TabList, Tab, TabPanel } from "@react-spectrum/s2";
import { Experience } from "@adobe/genstudio-extensibility-sdk";
import { ClaimResults } from "../../types";
import SingleView from "./SingleView";
import OverallView from "./OverallView";
import { style } from "@react-spectrum/s2/style" with {type: 'macro'};
import { APP_METADATA } from "../../Constants";
import ExperienceSelector from "./SingleView/ExperienceSelector";

interface ResultsViewProps {
  viewMode: string;
  onViewModeChange: (mode: string) => void;
  claimsResults: ClaimResults[];
  selectedExperienceIndex: number | null;
  experiences: Experience[];
  onExperienceSelect: (index: number) => void;
}

// Reusable scroll container for tab panels
const ScrollPanel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    className={style({
      overflow: "auto",
      height: "full",
      paddingTop: 20,
    })}
  >
    {children}
  </div>
);

export default function ResultsView({
  viewMode,
  onViewModeChange,
  claimsResults,
  selectedExperienceIndex,
  experiences,
  onExperienceSelect,
}: ResultsViewProps) {
  return (
    <Tabs
      aria-label="Validation Results View Mode"
      selectedKey={viewMode}
      onSelectionChange={(key) => onViewModeChange(key as string)}
    >
      <TabList>
        <Tab aria-label="Single View" id="single">
          Single View
        </Tab>
        <Tab aria-label="Overall View" id="all">
          Overall View
        </Tab>
      </TabList>
      <TabPanel id="single">
        <ScrollPanel>
          {APP_METADATA.options?.validation?.singleExperienceViewMode ? null : (
            <ExperienceSelector
              experiences={experiences}
              onExperienceSelect={onExperienceSelect}
            />
          )}
          <SingleView
            claims={claimsResults}
            experienceNumber={selectedExperienceIndex ?? 0}
          />
        </ScrollPanel>
      </TabPanel>
      <TabPanel id="all">
        <ScrollPanel>
          <OverallView experiences={experiences} claimsResults={claimsResults} />
        </ScrollPanel>
      </TabPanel>
    </Tabs>
  );
}

