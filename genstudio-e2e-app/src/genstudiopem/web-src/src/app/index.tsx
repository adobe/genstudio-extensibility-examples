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

import React from "react";
import { ErrorBoundary } from "react-error-boundary";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import ExtensionRegistration from "./ExtensionRegistration";
import ValidationPanel from "../components/Validation";
import PromptDialog from "../components/Prompt";
import AssetViewer from "../components/SelectContent";
import TemplateViewer from "../components/ImportTemplate";
import FragmentSwapDialog from "../components/FragmentSwap";
import {
  VALIDATION_ROUTE,
  PROMPT_ROUTE,
  SELECT_CONTENT_ROUTE,
  IMPORT_TEMPLATE_ROUTE,
  FRAGMENT_SWAP_ROUTE,
} from "../Constants";

const ErrorFallback = () => <h1>Something went wrong!</h1>;

const App = (): React.JSX.Element => {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div style={{ height: "100vh", overflow: "auto", background: "#f5f5f5" }}>
        <Router>
          <Routes>
            <Route path="/" element={<ExtensionRegistration />} />
            <Route path={VALIDATION_ROUTE} element={<ValidationPanel />} />
            <Route path={PROMPT_ROUTE} element={<PromptDialog />} />
            <Route path={SELECT_CONTENT_ROUTE} element={<AssetViewer />} />
            <Route path={IMPORT_TEMPLATE_ROUTE} element={<TemplateViewer />} />
            <Route path={FRAGMENT_SWAP_ROUTE} element={<FragmentSwapDialog />} />
          </Routes>
        </Router>
      </div>
    </ErrorBoundary>
  );
};

export default App;
