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
import {
  Accordion,
  AccordionItem,
  AccordionItemTitle,
  AccordionItemPanel,
  Heading,
  Text,
  Divider,
} from "@react-spectrum/s2";
import {
  GenerationContext,
  AdditionalContext,
  SectionGenerationContext,
  Experience,
} from "@adobe/genstudio-extensibility-sdk";

const col = { display: "flex", flexDirection: "column" as const };

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  if (children === undefined || children === null) return null;
  return (
    <div style={{ ...col, gap: "0.1rem" }}>
      <Text><strong>{label}</strong></Text>
      <Text>{children}</Text>
    </div>
  );
}

function formatEntity(entity: { id: string; name?: string }): string {
  return entity.name ? `${entity.name} (${entity.id})` : entity.id;
}

function AdditionalContextsView({ contexts }: { contexts: AdditionalContext<any>[] }) {
  if (contexts.length === 0) return null;
  return (
    <div style={{ ...col, gap: "0.5rem" }}>
      <Heading level={4}>Additional Contexts</Heading>
      {contexts.map((ctx, i) => (
        <div key={i} style={{ ...col, gap: "0.25rem", paddingLeft: "0.5rem" }}>
          <Field label="Extension">{ctx.extensionId}</Field>
          <div style={{ ...col, gap: "0.1rem" }}>
            <Text><strong>Type</strong></Text>
            <Text>{ctx.additionalContextType}</Text>
          </div>
          <div style={{ ...col, gap: "0.1rem" }}>
            <Text><strong>Values</strong></Text>
            {ctx.additionalContextValues.map((v: any, j: number) => (
              <Text key={j}>
                {"• "}
                {typeof v === "object" && v !== null
                  ? v.description ?? JSON.stringify(v)
                  : String(v)}
              </Text>
            ))}
          </div>
          {i < contexts.length - 1 && <Divider size="S" />}
        </div>
      ))}
    </div>
  );
}

function SectionsView({ sections }: { sections: SectionGenerationContext[] }) {
  return (
    <div style={{ ...col, gap: "0.5rem" }}>
      <Heading level={4}>Sections</Heading>
      {sections.map((section, i) => (
        <div key={i} style={{ ...col, gap: "0.25rem", paddingLeft: "0.5rem" }}>
          <Field label="Section ID">{section.id}</Field>
          {section.product && (
            <Field label="Product">{formatEntity(section.product)}</Field>
          )}
          {section.additionalContexts && section.additionalContexts.length > 0 && (
            <AdditionalContextsView contexts={section.additionalContexts} />
          )}
          {i < sections.length - 1 && <Divider size="S" />}
        </div>
      ))}
    </div>
  );
}

function SourceExperienceView({ experience }: { experience: Experience }) {
  const fields = Object.values(experience.experienceFields);
  return (
    <div style={{ ...col, gap: "0.5rem" }}>
      <Heading level={4}>Source Experience</Heading>
      <div style={{ ...col, gap: "0.25rem", paddingLeft: "0.5rem" }}>
        <Field label="ID">{experience.id}</Field>
        {experience.template && (
          <Field label="Template">{experience.template.title ?? experience.template.id}</Field>
        )}
        {experience.metadata?.locale && (
          <Field label="Locale">{experience.metadata.locale}</Field>
        )}
        {fields.length > 0 && (
          <div style={{ ...col, gap: "0.25rem" }}>
            <Text><strong>Fields</strong></Text>
            {fields.map((field) => (
              <div key={field.fieldName} style={{ ...col, gap: "0.1rem", paddingLeft: "0.5rem" }}>
                <Text><strong>{field.fieldName}</strong></Text>
                <Text>{field.fieldValue}</Text>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * GenerationContext component that displays the generation context in an accordion.
 * Renders the context as a structured view using Spectrum 2 components.
 */
export default function GenerationContextView({
  generationContext,
}: {
  generationContext: GenerationContext | null;
}) {
  if (!generationContext) {
    return (
      <Accordion>
        <AccordionItem id="generation-context">
          <AccordionItemTitle>Generation Context</AccordionItemTitle>
          <AccordionItemPanel>
            <Text>No generation context available.</Text>
          </AccordionItemPanel>
        </AccordionItem>
      </Accordion>
    );
  }

  return (
    <Accordion>
      <AccordionItem id="generation-context">
        <AccordionItemTitle>Generation Context</AccordionItemTitle>
        <AccordionItemPanel>
          <div style={{ ...col, gap: "0.75rem" }}>
            {generationContext.userPrompt && (
              <Field label="User Prompt">{generationContext.userPrompt}</Field>
            )}

            <Divider size="S" />

            <div style={{ ...col, gap: "0.25rem" }}>
              <Field label="ID">{generationContext.id}</Field>
              <Field label="Locale">{generationContext.locale}</Field>
              {generationContext.channel && (
                <Field label="Channel">{formatEntity(generationContext.channel)}</Field>
              )}
              {generationContext.brand && (
                <Field label="Brand">{formatEntity(generationContext.brand)}</Field>
              )}
              {generationContext.persona && (
                <Field label="Persona">{formatEntity(generationContext.persona)}</Field>
              )}
              {generationContext.product && (
                <Field label="Product">{formatEntity(generationContext.product)}</Field>
              )}
            </div>

            {generationContext.additionalContexts &&
              generationContext.additionalContexts.length > 0 && (
                <>
                  <Divider size="S" />
                  <AdditionalContextsView contexts={generationContext.additionalContexts} />
                </>
              )}

            {generationContext.sections && generationContext.sections.length > 0 && (
              <>
                <Divider size="S" />
                <SectionsView sections={generationContext.sections} />
              </>
            )}

            {generationContext.sourceExperience && (
              <>
                <Divider size="S" />
                <SourceExperienceView experience={generationContext.sourceExperience} />
              </>
            )}
          </div>
        </AccordionItemPanel>
      </AccordionItem>
    </Accordion>
  );
}
