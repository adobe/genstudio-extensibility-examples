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
import { TemplateSearchParams, Template } from "../types";
import { actionWebInvoke } from "../utils/actionWebInvoke";
import actions from "../config.json";
import { LOAD_TEMPLATE_ACTION } from "../Constants";

interface Auth {
  imsToken: string;
  imsOrg: string;
}


export const useTemplateActions = (auth: Auth | null) => {
  const [templates, setTemplates] =  useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fetchTemplates = useCallback(async (
    params: TemplateSearchParams = { limit: 100, offset: 0 }
  ) => {
    setIsLoading(true);
    setError(null);
  
  try {
    if(!auth){
      return;
    }
    const url = actions[LOAD_TEMPLATE_ACTION];
    const response = await actionWebInvoke(
      url,
      auth?.imsToken,
      auth?.imsOrg,
      params
    );
    
    if (response && typeof response === "object" && "templates" in response) {
      const validatedAssets = (response.templates as any[]).map(template => {
        const title = template.title || 'Unknown';
        return {
          id: template.id || '',
          title: title,
          thumbnailUrl: template.thumbnailUrl || '',
          content: template.url || '',
          mapping: template.mapping || {},
          metadata: template.metadata || {},
        };
      });
      if (Array.isArray(validatedAssets) && validatedAssets.length > 0) {
        setTemplates(validatedAssets as Template[]);
      } else {
        console.warn("Error fetching assets: no assets returned");
        setError("no assets returned");  
      }
    } else {
      console.warn("Error fetching assets: Invalid response format");
      setError("Invalid response format");  
    }
  } catch (err) {
    console.warn("Error fetching assets:", err);
    setError("Failed to fetch assets. Please try again.");
  } finally {
    setIsLoading(false);
  }
}, [auth]);

return {
  templates: templates,
  isLoading,
  error,
  fetchTemplates,
};
};
