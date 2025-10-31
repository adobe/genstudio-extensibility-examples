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
import { Card, CardPreview, Content, Text, Image, Footer, StatusLight, Divider } from "@react-spectrum/s2";
import { Asset } from "@adobe/genstudio-extensibility-sdk";
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

const formatFileSize = (bytes: number) => {
  if (!bytes) return "Unknown size";
  const kb = bytes / 1024;
  if (kb < 1024) {
    return `${Math.round(kb)}KB`;
  }
  const mb = kb / 1024;
  return `${mb.toFixed(1)}MB`;
};

const formatMimeType = (mimeType: string) => {
  return mimeType.split("/")[1].toUpperCase();
};

export function AssetCard({ asset }: { asset: Asset }) {
  const thumbnailUrl = asset.externalAssetInfo?.signedThumbnailUrl;
  const size = formatFileSize(asset.size);
  const mimeType = formatMimeType(asset.mimeType);
  return (
    <Card id={asset.id} textValue={asset.name}>
      {() => (
        <>
          <CardPreview>
            <Image
              src={thumbnailUrl}
              styles={style({
                width: "full",
                pointerEvents: "none",
                aspectRatio: "4/3",
                objectFit: "cover",
              })}
            />
          </CardPreview>
          <Content>
            <Text slot="title">{asset.name}</Text>
            <Text UNSAFE_style={{ fontSize: "12px", fontWeight: 'normal' }} styles={style({color: 'gray-500'})}>
              {mimeType} | {size}
            </Text>
          </Content>
        </>
      )}
    </Card>
  );
}
