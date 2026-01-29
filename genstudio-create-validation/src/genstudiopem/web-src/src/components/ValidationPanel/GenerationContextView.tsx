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
  Accordion,
  AccordionItem,
  AccordionItemTitle,
  AccordionItemPanel,
  Text,
} from "@react-spectrum/s2";
import {
  ValidationExtensionService,
  GenerationContext as GenerationContextType,
} from "@adobe/genstudio-extensibility-sdk";

/**
 * GenerationContext component that displays the generation context in an accordion.
 * Fetches and renders the generation context using ValidationExtensionService.
 * @param guestConnection - The guest connection to use for fetching generation context
 * @returns The GenerationContext component
 */
export default function GenerationContextView({
  generationContext,
}: {
  generationContext: GenerationContextType | null;
}) {
  const renderContextContent = () => {
    if (!generationContext) {
      return <Text>No generation context available.</Text>;
    }

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <pre>{JSON.stringify(generationContext, null, 2)}</pre>
      </div>
    );
  };

  return (
    <Accordion>
      <AccordionItem id="generation-context">
        <AccordionItemTitle>Generation Context</AccordionItemTitle>
        <AccordionItemPanel>{renderContextContent()}</AccordionItemPanel>
      </AccordionItem>
    </Accordion>
  );
}
