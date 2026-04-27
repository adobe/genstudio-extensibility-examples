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

import React, { useState, useEffect } from "react";
import { Heading } from "@react-spectrum/s2";
import {
  ImportTemplateExtensionService,
  Template,
  Mapping,
} from "@adobe/genstudio-extensibility-sdk";
import { useGuestConnection, useAuth } from "../../hooks";
import { EXTENSION_ID, EXTENSION_LABEL } from "../../Constants";

const COMMON_MAPPING: Mapping = {
  head: "headline",
  subhead: "sub_headline",
  content: "body",
  content1: "body",
  btn: "cta",
};

const buildStyles = (accent: string): string => `
  body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: #f9f9f9; color: #333; }
  .email-container { max-width: 600px; margin: 20px auto; background: #fff; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; }
  .variant-label { padding: 8px 20px; font-size: 11px; color: #fff; background: ${accent}; letter-spacing: 0.5px; }
  .preheader { padding: 8px 20px; font-size: 12px; color: #666; background: #f0f0f0; }
  .banner img { width: 100%; height: auto; display: block; }
  .head { background: #000; color: #fff; text-align: center; padding: 20px; }
  .head h1 { margin: 0; font-size: 24px; }
  .subhead { padding: 20px; color: #857b7b; }
  .content { padding: 0 20px 20px; }
  .content p { line-height: 1.6; margin: 10px 0; }
  .cta { margin: 20px 0; text-align: center; }
  .cta a { display: inline-block; background: ${accent}; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 4px; }
  .footer { font-size: 12px; color: #666; text-align: center; padding: 10px 20px; background: #f0f0f0; }
`;

const templateA = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>E2E Template A</title>
    <style>${buildStyles("#1473E6")}</style>
  </head>
  <body>
    <div class="email-container" data-variant="A">
      <div class="variant-label">E2E Template A — Simple</div>
      <div class="banner"><img src="{{image}}" alt="Banner" /></div>
      <div class="head"><h1>{{head}}</h1></div>
      <div class="subhead">{{subhead}}</div>
      <div class="content"><p>{{content}}</p></div>
      <div class="cta"><a href="{{link}}">{{btn}}</a></div>
      <div class="footer">E2E Test App — Variant A</div>
    </div>
  </body>
</html>`;

const templateB = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>E2E Template B</title>
    <style>${buildStyles("#2D9D5F")}</style>
  </head>
  <body>
    <div class="email-container" data-variant="B">
      <div class="variant-label">E2E Template B — With Banner</div>
      <div class="banner"><img src="{{image}}" alt="Banner" /></div>
      <div class="head"><h1>{{head}}</h1></div>
      <div class="subhead">{{subhead}}</div>
      <div class="content"><p>{{content}}</p></div>
      <div class="cta"><a href="{{link}}">{{btn}}</a></div>
      <div class="footer">E2E Test App — Variant B</div>
    </div>
  </body>
</html>`;

const templateC = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>E2E Template C</title>
    <style>${buildStyles("#E8730C")}</style>
  </head>
  <body>
    <div class="email-container" data-variant="C">
      <div class="variant-label">E2E Template C — With Preheader</div>
      <div class="preheader">{{pre_header}}</div>
      <div class="banner"><img src="{{image}}" alt="Banner" /></div>
      <div class="head"><h1>{{head}}</h1></div>
      <div class="subhead">{{subhead}}</div>
      <div class="content">
        <p>{{content}}</p>
        <p>{{content1}}</p>
      </div>
      <div class="cta"><a href="{{link}}">{{btn}}</a></div>
      <div class="footer">E2E Test App — Variant C</div>
    </div>
  </body>
</html>`;

const MOCK_TEMPLATES: Template[] = [
  {
    id: "e2e-template-a",
    title: "E2E Template A",
    source: EXTENSION_LABEL,
    content: templateA,
    mapping: COMMON_MAPPING,
  },
  {
    id: "e2e-template-b",
    title: "E2E Template B",
    source: EXTENSION_LABEL,
    content: templateB,
    mapping: COMMON_MAPPING,
  },
  {
    id: "e2e-template-c",
    title: "E2E Template C",
    source: EXTENSION_LABEL,
    content: templateC,
    mapping: COMMON_MAPPING,
  },
];

export default function TemplateViewer(): React.JSX.Element {
  const guestConnection = useGuestConnection(EXTENSION_ID);
  const auth = useAuth(guestConnection);
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | undefined>(undefined);

  const handleTemplateClick = (template: Template) => {
    setSelectedId((current) => current === template.id ? undefined : template.id);
    setSelectedTemplate((current) => current?.id === template.id ? undefined : template);
  };

  useEffect(() => {
    if (guestConnection) {
      ImportTemplateExtensionService.setSelectedTemplate(guestConnection, selectedTemplate);
    }
  }, [selectedTemplate, guestConnection]);

  const ready = Boolean(auth && guestConnection);

  return (
    <div data-testid="template-viewer" style={{ padding: "24px" }}>
      <Heading>Template Viewer</Heading>
      {ready ? (
        <div
          data-testid="template-viewer-ready"
          role="list"
          aria-label="E2E Templates"
          style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "16px" }}
        >
          {MOCK_TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              role="listitem"
              data-testid={`template-card-${t.id}`}
              data-template-id={t.id}
              data-template-name={t.title}
              aria-pressed={selectedId === t.id}
              onClick={() => handleTemplateClick(t)}
              style={{
                padding: "12px 16px",
                textAlign: "left",
                border:
                  selectedId === t.id
                    ? "2px solid #1473E6"
                    : "1px solid #ccc",
                background: selectedId === t.id ? "#E6F2FF" : "#fff",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              {t.title}
            </button>
          ))}
          {selectedId ? (
            <div
              data-testid={`template-selected-${selectedId}`}
              style={{ marginTop: "12px", fontSize: "12px", color: "#666" }}
            >
              Selected: {selectedId}
            </div>
          ) : null}
        </div>
      ) : (
        <div data-testid="template-viewer-loading">Connecting to host...</div>
      )}
    </div>
  );
}
