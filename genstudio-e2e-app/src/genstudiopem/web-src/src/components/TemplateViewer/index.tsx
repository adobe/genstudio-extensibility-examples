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

type FixtureMode = "basic" | "ac4" | "ac5" | "errors" | "all";

const parseRuntimeFixtureMode = (): FixtureMode => {
  const url = new URL(window.location.href);
  const hashQuery = url.hash.includes("?") ? url.hash.split("?")[1] : "";
  const hashParams = new URLSearchParams(hashQuery);
  const fixtureParam =
    hashParams.get("fixture") ??
    hashParams.get("scenario") ??
    url.searchParams.get("fixture") ??
    url.searchParams.get("scenario") ??
    "all";

  const normalized = fixtureParam.toLowerCase();
  if (normalized === "ac4" || normalized === "ac5" || normalized === "errors" || normalized === "all") {
    return normalized;
  }
  return "all";
};

const COMMON_MAPPING: Mapping = {
  head: "headline",
  head1: "headline",
  head2: "headline",
  subhead: "sub_headline",
  subhead1: "sub_headline",
  subhead2: "sub_headline",
  content: "body",
  content1: "body",
  content2: "body",
  btn: "cta",
  btn1: "cta",
  btn2: "cta",
  pod1_head: "headline",
  pod1_head1: "headline",
  pod1_head2: "headline",
  pod1_subhead: "sub_headline",
  pod1_subhead1: "sub_headline",
  pod1_subhead2: "sub_headline",
  pod1_content: "body",
  pod1_content1: "body",
  pod1_content2: "body",
  pod1_btn: "cta",
  pod1_btn1: "cta",
  pod1_btn2: "cta",
  pod2_head: "headline",
  pod2_head1: "headline",
  pod2_head2: "headline",
  pod2_subhead: "sub_headline",
  pod2_subhead1: "sub_headline",
  pod2_subhead2: "sub_headline",
  pod2_content: "body",
  pod2_content1: "body",
  pod2_content2: "body",
  pod2_btn: "cta",
  pod2_btn1: "cta",
  pod2_btn2: "cta",
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

const templateNoPodDuplicateFields = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>E2E Template No Pod Duplicate</title>
    <style>${buildStyles("#0F8B8D")}</style>
  </head>
  <body>
    <div class="email-container" data-variant="NoPodDuplicate">
      <div class="variant-label">E2E Template — No Pod Duplicate Fields</div>
      <div class="banner"><img src="{{image}}" alt="Banner" /></div>
      <div class="head">
        <h1>{{head}}</h1>
        <h1>{{head1}}</h1>
      </div>
      <div class="subhead">{{subhead}}</div>
      <div class="content">
        <p>{{content}}</p>
        <p>{{content1}}</p>
      </div>
      <div class="cta"><a href="{{link}}">{{btn}}</a></div>
      <div class="footer">E2E Test App — AC4 Duplicate Fields</div>
    </div>
  </body>
</html>`;

const templateTwoPods = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>E2E Template Two Pods</title>
    <style>${buildStyles("#8C5AE6")}</style>
  </head>
  <body>
    <div class="email-container" data-variant="TwoPods">
      <div class="variant-label">E2E Template — Two Pods</div>
      <div class="preheader">{{pre_header}}</div>
      <div class="content">
        <h2>Pod 1</h2>
        <p><strong>{{pod1_head}}</strong></p>
        <p>{{pod1_subhead}}</p>
        <p>{{pod1_content}}</p>
        <div class="cta"><a href="{{pod1_link}}">{{pod1_btn}}</a></div>
      </div>
      <div class="content">
        <h2>Pod 2</h2>
        <p><strong>{{pod2_head}}</strong></p>
        <p>{{pod2_subhead}}</p>
        <p>{{pod2_content}}</p>
        <div class="cta"><a href="{{pod2_link}}">{{pod2_btn}}</a></div>
      </div>
      <div class="footer">E2E Test App — AC4 Multi Pod</div>
    </div>
  </body>
</html>`;

const templateTwoPodsDuplicateFields = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>E2E Template Two Pods Duplicate</title>
    <style>${buildStyles("#A63D40")}</style>
  </head>
  <body>
    <div class="email-container" data-variant="TwoPodsDuplicate">
      <div class="variant-label">E2E Template — Two Pods Duplicate Fields</div>
      <div class="content">
        <h2>Pod 1</h2>
        <p><strong>{{pod1_head}}</strong></p>
        <p><strong>{{pod1_head1}}</strong></p>
        <p>{{pod1_content}}</p>
        <p>{{pod1_content1}}</p>
      </div>
      <div class="content">
        <h2>Pod 2</h2>
        <p><strong>{{pod2_head}}</strong></p>
        <p><strong>{{pod2_head1}}</strong></p>
        <p>{{pod2_subhead}}</p>
        <p>{{pod2_subhead1}}</p>
        <p>{{pod2_content}}</p>
      </div>
      <div class="footer">E2E Test App — AC4 Multi Pod Duplicate Fields</div>
    </div>
  </body>
</html>`;

const templateInvalidHtml = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>E2E Template Invalid HTML</title>
  </head>
  <body>
    <div class="email-container">
      <h1>{{head}}</h1>
      <p>{{content}}</p>
      <div>{{missing_close_tag}
  </body>
</html>`;

const BASE_TEMPLATES: Template[] = [
  {
    id: "e2e-template-a",
    title: "E2E Template A",
    source: EXTENSION_LABEL,
    content: templateA,
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

const AC4_TEMPLATES: Template[] = [
  {
    id: "e2e-template-no-pod-duplicate-fields",
    title: "E2E Template No Pod Duplicate Fields",
    source: EXTENSION_LABEL,
    content: templateNoPodDuplicateFields,
    mapping: COMMON_MAPPING,
    additionalMetadata: {
      scenario: "ac4",
      duplicateFields: true,
      multiPod: false,
    },
  },
  {
    id: "e2e-template-two-pods",
    title: "E2E Template Two Pods",
    source: EXTENSION_LABEL,
    content: templateTwoPods,
    mapping: COMMON_MAPPING,
    additionalMetadata: {
      scenario: "ac4",
      duplicateFields: false,
      multiPod: true,
    },
  },
  {
    id: "e2e-template-two-pods-duplicate-fields",
    title: "E2E Template Two Pods Duplicate Fields",
    source: EXTENSION_LABEL,
    content: templateTwoPodsDuplicateFields,
    mapping: COMMON_MAPPING,
    additionalMetadata: {
      scenario: "ac4",
      duplicateFields: true,
      multiPod: true,
    },
  },
];

const AC5_TEMPLATES: Template[] = [
  {
    id: "e2e-template-ac5-metadata",
    title: "E2E Template AC5 Metadata",
    source: EXTENSION_LABEL,
    content: templateA,
    mapping: COMMON_MAPPING,
    additionalMetadata: {
      scenario: "ac5",
      validationTag: "ac5-metadata-propagation",
      pods: 1,
      channelHints: ["email", "meta", "meta-hz"],
      sourceSystem: "extension-e2e-app",
    },
  },
];

const ERROR_TEMPLATES: Template[] = [
  {
    id: "e2e-template-invalid-html",
    title: "E2E Template Invalid HTML",
    source: EXTENSION_LABEL,
    content: templateInvalidHtml,
    mapping: COMMON_MAPPING,
    additionalMetadata: {
      scenario: "errors",
      expectedError: "parse-failure",
    },
  },
];

const getTemplatesByFixtureMode = (mode: FixtureMode): Template[] => {
  switch (mode) {
    case "ac4":
      return [...BASE_TEMPLATES, ...AC4_TEMPLATES];
    case "ac5":
      return [...BASE_TEMPLATES, ...AC5_TEMPLATES];
    case "errors":
      return [...BASE_TEMPLATES, ...ERROR_TEMPLATES];
    case "all":
      return [...BASE_TEMPLATES, ...AC4_TEMPLATES, ...AC5_TEMPLATES, ...ERROR_TEMPLATES];
    case "basic":
    default:
      return BASE_TEMPLATES;
  }
};

export default function TemplateViewer(): React.JSX.Element {
  const guestConnection = useGuestConnection(EXTENSION_ID);
  const auth = useAuth(guestConnection);
  const fixtureMode = parseRuntimeFixtureMode();
  const templates = getTemplatesByFixtureMode(fixtureMode);
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
          data-template-fixture-mode={fixtureMode}
          role="list"
          aria-label="E2E Templates"
          style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "16px" }}
        >
          <div data-testid={`template-fixture-mode-${fixtureMode}`} style={{ fontSize: "12px", color: "#666" }}>
            Fixture mode: {fixtureMode}
          </div>
          {templates.map((t) => (
            <button
              key={t.id}
              type="button"
              role="listitem"
              data-testid={`template-card-${t.id}`}
              data-template-id={t.id}
              data-template-name={t.title}
              data-template-scenario={(t.additionalMetadata as any)?.scenario ?? "basic"}
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
