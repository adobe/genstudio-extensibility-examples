/*
Copyright 2026 Adobe. All rights reserved.
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
} from "@adobe/genstudio-extensibility-sdk";
import { useGuestConnection, useAuth } from "../hooks";
import { EXTENSION_ID, EXTENSION_LABEL } from "../Constants";

const templateA = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>E2E Template A</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: #f9f9f9; color: #333; }
      .email-container { max-width: 600px; margin: 20px auto; background: #fff; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; }
      .variant-label { padding: 8px 20px; font-size: 11px; color: #fff; background: #1473E6; letter-spacing: 0.5px; }
      .banner img { width: 100%; height: auto; display: block; }
      .head { background: #000; color: #fff; text-align: center; padding: 20px; }
      .head h1 { margin: 0; font-size: 24px; }
      .subhead { padding: 20px; color: #857b7b; }
      .content { padding: 0 20px 20px; }
      .content p { line-height: 1.6; margin: 10px 0; }
      .cta { margin: 20px 0; text-align: center; }
      .cta a { display: inline-block; background: #1473E6; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 4px; }
      .footer { font-size: 12px; color: #666; text-align: center; padding: 10px 20px; background: #f0f0f0; }
    </style>
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

const TEMPLATE: Template = {
  id: "e2e-template-a",
  title: "E2E Template A",
  source: EXTENSION_LABEL,
  content: templateA,
  mapping: {
    head: "headline",
    subhead: "sub_headline",
    content: "body",
    btn: "cta",
  },
};

export default function ImportTemplate(): React.JSX.Element {
  const guestConnection = useGuestConnection(EXTENSION_ID);
  const auth = useAuth(guestConnection);
  const [selected, setSelected] = useState(false);

  useEffect(() => {
    if (guestConnection) {
      ImportTemplateExtensionService.setSelectedTemplate(
        guestConnection,
        selected ? TEMPLATE : undefined,
      );
    }
  }, [selected, guestConnection]);

  const ready = Boolean(auth && guestConnection);

  return (
    <div data-testid="template-viewer" style={{ padding: "24px" }}>
      <Heading>Template Viewer</Heading>
      {ready ? (
        <ul data-testid="template-viewer-ready" aria-label="E2E Templates"
          style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "16px", listStyle: "none", padding: 0, margin: 0 }}
        >
          <li>
            <button
              type="button"
              data-testid={`template-card-${TEMPLATE.id}`}
              data-template-id={TEMPLATE.id}
              data-template-name={TEMPLATE.title}
              aria-pressed={selected}
              onClick={() => setSelected((s) => !s)}
              style={{
                width: "100%",
                padding: "12px 16px",
                textAlign: "left",
                border: selected ? "2px solid #1473E6" : "1px solid #ccc",
                background: selected ? "#E6F2FF" : "#fff",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              {TEMPLATE.title}
            </button>
            {selected && (
              <div data-testid={`template-selected-${TEMPLATE.id}`}
                style={{ marginTop: "12px", fontSize: "12px", color: "#666" }}
              >
                Selected: {TEMPLATE.id}
              </div>
            )}
          </li>
        </ul>
      ) : (
        <div data-testid="template-viewer-loading">Connecting to host...</div>
      )}
    </div>
  );
}
