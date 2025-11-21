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

import React, { useEffect, useState } from "react";
import { CardView, SearchField, ProgressCircle } from "@react-spectrum/s2";
import { Selection } from "@react-types/shared";
import {
  ImportTemplateExtensionService,
  Template,
} from "@adobe/genstudio-extensibility-sdk";
import { TemplateCard } from "./TemplateCard";
import { useAuth, useGuestConnection, useTemplateActions } from "../hooks";
import { EXTENSION_ID, EXTENSION_LABEL } from "../Constants";

export default function TemplateViewer(): JSX.Element {
  // ==========================================================
  //                    STATE & HOOKS
  // ==========================================================
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<Selection>(
    new Set()
  );
  const [searchTerm, setSearchTerm] = useState("");

  const guestConnection = useGuestConnection(EXTENSION_ID);
  const auth = useAuth(guestConnection);
  const { templates, fetchTemplates, isLoading } = useTemplateActions(auth);

  // ==========================================================
  //                    EFFECTS & HOOKS
  // ==========================================================

  /**
   * Fetch templates when auth becomes available
   */
  useEffect(() => {
    if (auth) {
      fetchTemplates();
    }
  }, [auth, fetchTemplates]);

  /**
   * Update the host with the currently selected template
   * Syncs template selection state with the GenStudio host
   */
  useEffect(() => {
    if (!guestConnection) return;

    const selectedTemplateIdsList = Array.from(selectedTemplateIds);
    const selectedTemplate =
      selectedTemplateIdsList.length > 0
        ? Object.assign(
            {},
            templates.find(
              (t) => t.id === selectedTemplateIdsList[0]
            ) as Template,
            {
              source: EXTENSION_LABEL,
              additionalMetadata: { thumbnailUrl: undefined },
            }
          ) || undefined
        : undefined;

    ImportTemplateExtensionService.setSelectedTemplate(
      guestConnection,
      selectedTemplate
    );
  }, [selectedTemplateIds, guestConnection, templates]);

  // ==========================================================
  //                    HANDLERS & FUNCTIONS
  // ==========================================================

  /**
   * Filters templates based on search term
   * @returns Filtered template array
   */
  const getFilteredTemplates = (): Template[] => {
    if (!searchTerm) return templates;

    return templates.filter((t) =>
      (t.title ?? "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  /**
   * Handles search term changes
   * @param value - New search term
   */
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  // ==========================================================
  //                        RENDER
  // ==========================================================
  const filteredTemplates = getFilteredTemplates();

  const containerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "32px 32px",
  };

  const contentContainerStyle: React.CSSProperties = {
    width: "100%",
    marginTop: "24px",
  };

  const centerContentStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  };

  const emptyStateStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "200px",
    width: "100%",
    fontSize: "1.2rem",
    color: "#666",
    textAlign: "center",
  };

  /**
   * Renders the template content based on loading and data state
   */
  const renderTemplateContent = () => {
    if (isLoading) {
      return (
        <div style={centerContentStyle}>
          <ProgressCircle aria-label="Loading templates" isIndeterminate />
        </div>
      );
    }

    if (filteredTemplates.length === 0) {
      return (
        <div style={emptyStateStyle}>
          {templates.length === 0
            ? "No templates available."
            : "No templates found matching your search."}
        </div>
      );
    }

    return (
      <CardView
        aria-label="Templates"
        loadingState={isLoading ? "loading" : "idle"}
        selectionMode="single"
        selectedKeys={selectedTemplateIds}
        onSelectionChange={setSelectedTemplateIds}
      >
        {filteredTemplates.map((template) => (
          <TemplateCard key={template.id} template={template} />
        ))}
      </CardView>
    );
  };

  return (
    <div style={containerStyle}>
      <SearchField
        value={searchTerm}
        onChange={handleSearchChange}
        placeholder="Search templates"
        aria-label="Search templates"
      />
      <div style={contentContainerStyle}>{renderTemplateContent()}</div>
    </div>
  );
}
