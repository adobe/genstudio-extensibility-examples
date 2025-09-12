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
import { TemplateCard } from "./TemplateCard";
import { useTemplateActions } from "../hooks/useTemplateActions";
import { extensionId, extensionLabel } from "../Constants";
import { useGuestConnection } from "../hooks";
import { Selection } from "@react-types/shared";
import {
  ImportTemplateExtensionService,
  Template,
} from "@adobe/genstudio-extensibility-sdk";

interface Auth {
  imsToken: string;
  imsOrg: string;
}

export default function TemplateViewer(): JSX.Element {
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<Selection>(
    new Set()
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [auth, setAuth] = useState<Auth | null>(null);
  const guestConnection = useGuestConnection(extensionId);
  const { templates, fetchTemplates, isLoading } = useTemplateActions(
    auth as Auth
  );

  useEffect(() => {
    if (auth) {
      fetchTemplates();
    }
  }, [auth]);

  useEffect(() => {
    const sharedAuth = guestConnection?.sharedContext.get("auth");

    if (sharedAuth) {
      setAuth(sharedAuth);
    }
  }, [guestConnection]);

  const filteredTemplates = !searchTerm
    ? templates
    : templates.filter((t) =>
        (t.title ?? "").toLowerCase().includes(searchTerm.toLowerCase())
      );

  useEffect(() => {
    console.log("filteredTemplates", filteredTemplates);
  }, [filteredTemplates]);

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
              source: extensionLabel,
              additionalMetadata: { thumbnailUrl: undefined },
            }
          ) || undefined
        : undefined;
    ImportTemplateExtensionService.setSelectedTemplate(
      guestConnection,
      selectedTemplate
    );
  }, [selectedTemplateIds, guestConnection]);

  const renderTemplateContent = () => {
    if (filteredTemplates.length === 0) {
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "200px",
            width: "100%",
            fontSize: "1.2rem",
            color: "#666",
            textAlign: "center",
          }}
        >
          No templates found.
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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "32px 32px",
      }}
    >
      <SearchField
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Search templates"
        width="400px"
      />
      <div style={{ width: "100%", marginTop: "24px" }}>
        {isLoading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
            }}
          >
            <ProgressCircle aria-label="Loading templates" isIndeterminate />
          </div>
        ) : (
          renderTemplateContent()
        )}
      </div>
    </div>
  );
}
