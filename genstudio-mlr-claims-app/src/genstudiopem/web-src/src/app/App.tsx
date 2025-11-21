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
import { Provider as S2Provider, Heading } from "@react-spectrum/s2";
import { ErrorBoundary } from "react-error-boundary";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { style } from "@react-spectrum/s2/style" with {type: 'macro'};
import ExtensionRegistration from "./ExtensionRegistration";
import ValidationPanel from "../components/ValidationPanel";
import AdditionalContextDialog from "../components/AdditionalContextDialog";
import { PROMPT_APP_ROUTE, VALIDATION_APP_ROUTE } from "../Constants";

const ErrorFallback = () => <Heading>Something went wrong!</Heading>;

const App = (): React.JSX.Element => {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <S2Provider
        background="base"
        colorScheme="light"
        styles={style({ height: "screen", overflow: "auto" })}
      >
        <Router>
          <Routes>
            <Route path="/" element={<ExtensionRegistration />} />
            <Route path={VALIDATION_APP_ROUTE} element={<ValidationPanel />} />
            <Route
              path={PROMPT_APP_ROUTE}
              element={<AdditionalContextDialog />}
            />
          </Routes>
        </Router>
      </S2Provider>
    </ErrorBoundary>
  );
};

export default App;
