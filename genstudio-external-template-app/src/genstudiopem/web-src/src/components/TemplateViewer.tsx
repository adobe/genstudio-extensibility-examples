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
import {
  Flex,
  View,
  Grid,
  SearchField,
  ProgressCircle,
  Well,
} from "@adobe/react-spectrum";
import TemplateCard from "./TemplateCard";
import { useTemplateActions } from "../hooks/useTemplateActions";
import { Template } from "@adobe/genstudio-extensibility-sdk";
import { extensionId } from "../Constants";
import { useGuestConnection } from "../hooks";

interface Auth {
    imsToken: string;
    imsOrg: string;
  }

export default function TemplateViewer(): JSX.Element {
  const [searchTerm, setSearchTerm] = useState("");
  const [auth, setAuth] = useState<Auth | null>(null);
  const guestConnection = useGuestConnection(extensionId);
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<Set<string>>(new Set());
  const {
    templates,
    fetchTemplates,
    isLoading
  } = useTemplateActions(auth as Auth);

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
    
      const filteredTemplates = !searchTerm ? templates
      : templates.filter(t => (t.title ?? "").toLowerCase().includes(searchTerm.toLowerCase()));

  const handleSelect = (template: Template) => {
    const keyId = (template as any).templateId || template.id;
    // single selection: only keep the clicked key selected
    setSelectedTemplateIds(() => new Set([keyId]));
  };

  const renderTemplate = (template: Template) => {
    const keyId = (template as any).templateId || template.id;
    const isSelected = selectedTemplateIds.has(keyId);
    return (
      <TemplateCard key={keyId} template={template} isSelected={isSelected} onSelect={handleSelect}/>
    );
  };

  const renderTemplateContent = () => {
    if (isLoading) {
      return (
        <Flex alignItems="center" justifyContent="center" height="100%">
          <ProgressCircle aria-label="Loading templates" isIndeterminate />
        </Flex>
      );
    }

    if (filteredTemplates.length === 0) {
      return <Well>No templates found.</Well>;
    }

    return (
      <Grid
        columns="repeat(auto-fill, 230px)"
        autoRows="auto"
        justifyContent="center"
        gap="size-300"
        width="100%"
      >
        {filteredTemplates.map((template: Template) => renderTemplate(template))}
      </Grid>
    );
  };

  return (
    <View height="100%" width="100%">
      <Flex direction="column" height="100%">
        <View
          UNSAFE_style={{ backgroundColor: "var(--spectrum-gray-100)" }}
          padding="size-300"
        >
          <Flex
            direction="row"
            justifyContent="center"
            alignItems="center"
            gap="size-200"
          >
           <SearchField
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search templates"
              width="400px"
              maxWidth="90%"
            />
          </Flex>
        </View>
        <View
          flex={1}
          UNSAFE_style={{ backgroundColor: "var(--spectrum-gray-100)" }}
          padding="size-300"
          overflow="auto"
        >
          {renderTemplateContent()}
        </View>
      </Flex>
    </View>
  );
}
