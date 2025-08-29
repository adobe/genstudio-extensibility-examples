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
import { useAssetActions } from "../hooks/useAssetActions";
import { DamAsset } from "../types";
import { extensionId } from "../Constants";
import { useGuestConnection } from "../hooks";

interface Auth {
    imsToken: string;
    imsOrg: string;
  }

//import linkedThumbnail from "./email-template.webp";

export default function TemplateViewer(): JSX.Element {
  const [searchTerm, setSearchTerm] = useState("");
  const hasInitialLoad = useRef(false);
  const [isLoading] = useState(false);
  const [auth, setAuth] = useState<any>(null);
  const guestConnection = useGuestConnection(extensionId);

  //const { templates, isLoading, fetchTemplates, error } = useTemplateActions(null);
  // at top
  const [templates, setTemplates] = useState<DamAsset[]>([]);
  const {
    assets,
    fetchAssets,
  } = useAssetActions(auth);
//   const linkedThumbnail: string = new URL(
//     "./email-template.webp",
//     import.meta.url
//   ).toString();
//   const linkedThumbnail2: string = new URL(
//     "./email_template_two_pod.webp",
//     import.meta.url
//   ).toString();
  // on mount

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  
//   useEffect(() => {
//     // 1) Show local placeholders immediately
//   setTemplates([
//     { id: "local-1", name: "email-template-w_linked-image.html", fileType: "HTML", thumbnailUrl: linkedThumbnail, url: "", metadata: {}, dateCreated: new Date().toISOString(), dateModified: new Date().toISOString() },
//     { id: "local-2", name: "email-template-w_linked-image-pod.html", fileType: "HTML", thumbnailUrl: linkedThumbnail2, url: "", metadata: {}, dateCreated: new Date().toISOString(), dateModified: new Date().toISOString() },
//   ]);
//   }, []);

  //   useEffect(() => {
  //     fetchTemplates();
  //   }, [fetchTemplates]);
  useEffect(() => {
    debugger
    const sharedAuth = guestConnection?.sharedContext.get("auth");
    console.log("sharedAuth", sharedAuth);

    if (sharedAuth) {
      setAuth(sharedAuth);
    }
  }, [guestConnection]);

  useEffect(() => {
    if (templates.length > 0 && !hasInitialLoad.current) {
      hasInitialLoad.current = true;
    }
  }, [templates.length]);

//   const filtered = !searchTerm.trim()
//     ? templates
//     : templates.filter((t) =>
//         (t.name ?? "").toLowerCase().includes(searchTerm.toLowerCase())
//       );
    
      const filtered = !searchTerm ? assets
      : assets.filter(t => (t.name ?? "").toLowerCase().includes(searchTerm.toLowerCase()));
  const renderTemplate = (template: DamAsset) => (
    <TemplateCard key={template.id} template={template} isSelected={false} onSelect={() => {}}/>
  );

  const renderAssetContent = () => {
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
           HIII <SearchField
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
          {renderAssetContent()}
        </View>
      </Flex>
    </View>
  );
}
