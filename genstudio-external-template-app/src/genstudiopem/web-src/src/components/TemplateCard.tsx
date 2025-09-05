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

import React, { useState } from "react";
import { Image } from "@adobe/react-spectrum";
import { Template } from "@adobe/genstudio-extensibility-sdk";
import { Card, Content as CardContent, CardPreview, Text } from "@react-spectrum/s2";
import {
  style as styleMacro
} from "@react-spectrum/s2/style" with { type: "macro" };

interface TemplateCardProps {
    template: Template;
    isSelected: boolean;
    onSelect: (template: Template) => void;
}

export default function TemplateCard({template}: TemplateCardProps): JSX.Element {
  const imageStyles = styleMacro({
    width: "full",
    pointerEvents: "none",
    aspectRatio:"5/9",
    objectFit: "contain",
    backgroundColor: "gray-200",
  });

  return (
    <Card key={template.id} id={template.id} textValue={template.title} >
        <>
          <CardPreview>
          <div className={imageStyles}>
            <Image
              src={(template as any).thumbnailUrl || ''}
              width="100%"
              height="100%"
              objectFit="contain"
            />
            </div>
          </CardPreview>
          <CardContent>
            <Text slot="title">{template.title}</Text>
            <Text slot="description">{template.title}</Text>
          </CardContent>
        </>
    </Card>
);
}


