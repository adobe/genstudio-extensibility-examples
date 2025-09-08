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

import { useState, useCallback } from "react";
import { TemplateSearchParams, TemplateWithThumbnail } from "../types";
import { actionWebInvoke } from "../utils/actionWebInvoke";
import actions from "../config.json";
import { LOAD_TEMPLATE_ACTION } from "../Constants";

interface Auth {
  imsToken: string;
  imsOrg: string;
}

export const useTemplateActions = (auth: Auth | null) => {
  const [templates, setTemplates] = useState<TemplateWithThumbnail[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(
    async (params: TemplateSearchParams = { limit: 100, offset: 0 }) => {
      if (!auth) return;

      setIsLoading(true);
      setError(null);
      try {
        const url = actions[LOAD_TEMPLATE_ACTION];
        const { templates: fetchedTemplates = [] } = await actionWebInvoke<{
          templates: TemplateWithThumbnail[];
        }>(url, auth.imsToken, auth.imsOrg, params);
        setTemplates(fetchedTemplates);
      } catch (err) {
        console.warn("Error fetching templates:", err);
        setError("Failed to fetch templates. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [auth]
  );

  return {
    templates,
    isLoading,
    error,
    fetchTemplates,
  };
};
