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
import { View, Text } from "@adobe/react-spectrum";
import { DamAsset } from "../types";

interface TemplateCardProps {
    template: DamAsset;
    isSelected: boolean;
    onSelect: (asset: DamAsset) => void;
}

export default function TemplateCard({ template }: TemplateCardProps): JSX.Element {
  return (
    <View
      borderWidth="thin"
      borderColor="gray-300"
      borderRadius="regular"
      padding="size-200"
      width="230px"
      backgroundColor="static-white"
    >
        <img src={template.thumbnailUrl} alt={template.name} style={{ width: "100%", height: "auto" }} />
      <Text>{template.name}</Text>
    </View>
  );
}


