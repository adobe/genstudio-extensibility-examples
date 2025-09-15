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
  Card,
  CardPreview,
  Content,
  Text,
  Image,
} from "@react-spectrum/s2";
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};
import { Template } from "@adobe/genstudio-extensibility-sdk";

const DEFAULT_THUMBNAIL_URL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAACXBIWXMAAAsTAAALEwEAmpwYAAAADElEQVQImWPYtWsXAARgAi8sw/IhAAAAAElFTkSuQmCC';
export function TemplateCard({ template }: { template: Template }) {
  const thumbnailUrl = template.additionalMetadata?.thumbnailUrl || DEFAULT_THUMBNAIL_URL;
  return (
    <Card id={template.id} textValue={template.title}>
      {() => (
        <>
          <CardPreview>
            <Image
              src={thumbnailUrl}
              styles={style({
                width: "full",
                pointerEvents: "none",
                aspectRatio: "4/3",
                objectFit: "contain",
              })}
            />
          </CardPreview>
          <Content>
            <Text slot="title">{template.title}</Text>
          </Content>
        </>
      )}
    </Card>
  );
}
