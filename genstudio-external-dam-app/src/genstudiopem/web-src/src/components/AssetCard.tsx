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
import { View, Image, Text, Checkbox } from "@adobe/react-spectrum";
import { DamAsset } from "../types";

interface AssetCardProps {
  asset: DamAsset;
  isSelected: boolean;
  onSelect: (asset: DamAsset) => void;
}

const AssetCard: React.FC<AssetCardProps> = ({
  asset,
  isSelected,
  onSelect,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Format file size for display
  const formatFileSize = (bytes: number) => {
    if (!bytes) return "Unknown size";
    const kb = bytes / 1024;
    if (kb < 1024) {
      return `${Math.round(kb)}KB`;
    }
    const mb = kb / 1024;
    return `${mb.toFixed(1)}MB`;
  };

  // Card styles matching GenStudio interaction states exactly
  const cardStyles: React.CSSProperties = {
    cursor: "pointer",
    position: "relative",
    width: "230px",
    height: "241px",
    borderRadius: "var(--spectrum-global-dimension-size-50)", // Using Spectrum token
    backgroundColor: "var(--spectrum-global-color-gray-50)",
    overflow: "hidden",
    transition: "box-shadow 0.2s ease-out", // Simplified transition - only shadow, longer duration for stability
    transform: "translateZ(0)", // Force GPU acceleration to prevent flickering
    willChange: "box-shadow", // Hint to browser about what will change
    // Always use 2px border - just change transparency to avoid layout shifts
    border: isSelected ? "2px solid var(--spectrum-global-color-gray-900)" : "2px solid transparent",
    margin: "0px", // Keep consistent margin always
    // Shadow matching GenStudio cards - now reactive to both hover and selection state
    boxShadow: isSelected 
      ? "0px 4px 12px rgba(0, 0, 0, 0.15), 0px 1px 3px rgba(0, 0, 0, 0.1)"
      : isHovered
        ? "0px 4px 12px rgba(0, 0, 0, 0.15), 0px 2px 6px rgba(0, 0, 0, 0.1)"
        : "0px 1px 3px rgba(0, 0, 0, 0.1)",
  };

  // Hover handlers - simplified to only manage state
  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div 
      onClick={() => onSelect(asset)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={cardStyles}
    >
      <View 
        position="relative"
        height="192px"
        width="100%"
        overflow="hidden"
        backgroundColor="gray-100"
      >
        <Image
          src={asset.thumbnailUrl}
          alt={asset.name}
          objectFit="contain" // Reference image shows full image contained, not cropped
          width="100%"
          height="100%"
          UNSAFE_style={{ 
            // Image edge-to-edge with no border radius
            backgroundColor: "#F2F4F5" // Figma spec: background color
          }}
        />

        <View
          position="absolute"
          right="size-100"
          bottom="size-100"
          padding="size-50"
          borderRadius="small"
          UNSAFE_style={{
            backgroundColor: "rgba(0, 0, 0, 0.40)", // Correct transparency value
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <Text 
            UNSAFE_style={{ 
              // Badge text styling - using more Spectrum tokens
              color: "var(--spectrum-global-color-gray-50)", // Spectrum white token
              textAlign: "center",
              fontFamily: "var(--spectrum-global-font-family-base)", // Spectrum font family
              fontSize: "var(--spectrum-global-dimension-font-size-75)", // Spectrum font size
              fontStyle: "normal",
              fontWeight: "400", // Changed from 700 to normal weight for lighter appearance
              lineHeight: "130%",
              textTransform: "uppercase"
            }}>
            {asset.fileType}
          </Text>
        </View>

        {/* Custom checkbox - using Spectrum design tokens */}
        {(isHovered || isSelected) && (
          <div 
            style={{
              position: "absolute",
              top: "var(--spectrum-global-dimension-size-100)",
              left: "var(--spectrum-global-dimension-size-100)",
              zIndex: 10,
              cursor: "pointer"
            }}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              onSelect(asset);
            }}
          >
            <View
              width="size-200"
              height="size-200"
              borderRadius="medium"
              backgroundColor="static-white"
              UNSAFE_style={{
                backgroundColor: "rgba(255, 255, 255, 0.51)", // Keep transparency
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backdropFilter: "blur(4px)",
                padding: "var(--spectrum-global-dimension-size-50)"
              }}
            >
              <View
                width="size-150"
                height="size-150"
                borderRadius="small"
                backgroundColor={isSelected ? "gray-900" : "gray-50"}
                borderWidth="thin"
                borderColor="gray-900"
                UNSAFE_style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.15s ease-in-out"
                }}
              >
                {isSelected && (
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 14 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                      color: "#FFFFFF"
                    }}
                  >
                    <path
                      d="M11.5 3.5L5.5 9.5L2.5 6.5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </svg>
                )}
              </View>
            </View>
          </div>
        )}
      </View>

      <View 
        backgroundColor="gray-50"
        padding="size-100"
        UNSAFE_style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-start",
          height: "49px", // Keep specific height for layout
          borderRadius: "0px 0px var(--spectrum-global-dimension-size-50) var(--spectrum-global-dimension-size-50)"
        }}
      >
        <Text
          UNSAFE_style={{
            // Asset title styling - using more Spectrum tokens
            overflow: "hidden",
            color: "var(--spectrum-global-color-gray-900)", // Spectrum color token
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            fontFamily: "var(--spectrum-global-font-family-base)", // Spectrum font family
            fontSize: "var(--spectrum-global-dimension-font-size-100)", // Spectrum font size
            fontStyle: "normal",
            fontWeight: "700",
            lineHeight: "130%",
            textAlign: "left",
            marginBottom: "var(--spectrum-global-dimension-size-25)", // Spectrum spacing
            width: "100%"
          }}
        >
          {asset.name}
        </Text>
        <Text
          UNSAFE_style={{
            // Asset metadata styling - using Spectrum tokens
            fontFamily: "var(--spectrum-global-font-family-base)", // Spectrum font family
            fontSize: "var(--spectrum-global-dimension-font-size-75)", // Spectrum font size
            fontStyle: "normal",
            fontWeight: "400",
            lineHeight: "130%",
            color: "var(--spectrum-global-color-gray-700)", // Spectrum color token
            textAlign: "left"
          }}
        >
          {formatFileSize(asset.metadata?.size || 0)}
        </Text>
      </View>
    </div>
  );
};

export default AssetCard;
