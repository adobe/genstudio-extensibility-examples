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

import React, { useEffect, useRef, useState } from "react";
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
import { DamAsset } from "../types";
import { extensionId } from "../Constants";
import { useGuestConnection } from "../hooks";

interface Auth {
    imsToken: string;
    imsOrg: string;
  }

export default function TemplateViewer(): JSX.Element {
  const [searchTerm, setSearchTerm] = useState("");
  const hasInitialLoad = useRef(false);
  const [isLoading] = useState(false);
  const [auth, setAuth] = useState<Auth | null>(null);
  const guestConnection = useGuestConnection(extensionId);
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<Set<string>>(new Set());
  const {
    assets,
    fetchTemplates,
  } = useTemplateActions(auth as unknown as any);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  useEffect(() => {
    const sharedAuth = guestConnection?.sharedContext.get("auth");
    console.log("sharedAuth", sharedAuth);

    if (sharedAuth) {
      setAuth(sharedAuth);
    }
  }, [guestConnection]);

  useEffect(() => {
    if (assets.length > 0 && !hasInitialLoad.current) {
      hasInitialLoad.current = true;
    }
  }, [assets.length]);
    
      const filtered = !searchTerm ? assets
      : assets.filter(t => (t.name ?? "").toLowerCase().includes(searchTerm.toLowerCase()));

  const handleSelect = (asset: DamAsset) => {
    const keyId = (asset as any).templateId || asset.id;
    // single selection: only keep the clicked key selected
    setSelectedTemplateIds(() => new Set([keyId]));
  };

  const renderTemplate = (template: DamAsset) => {
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

    if (filtered.length === 0) {
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
        {filtered.map((template: DamAsset) => renderTemplate(template))}
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
