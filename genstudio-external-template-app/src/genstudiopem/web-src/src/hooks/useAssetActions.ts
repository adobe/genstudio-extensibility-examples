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
import { AssetSearchParams, DamAsset } from "../types";
import { actionWebInvoke } from "../utils/actionWebInvoke";
import actions from "../config.json";

interface Auth {
  imsToken: string;
  imsOrg: string;
}

// Define constants for our action endpoints
const SEARCH_ASSETS_ACTION = "genstudio-external-template-app/get-templates";


export const useAssetActions = (auth: Auth) => {
  const [baseAssets, setBaseAssets] = useState<DamAsset[]>([]);
  const [displayedAssets, setDisplayedAssets] = useState<DamAsset[]>([]);
  const [availableFileTypes, setAvailableFileTypes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const placeholderThumb = "https://via.placeholder.com/160x120?text=HTML";

  const extractFileTypes = (assetList: DamAsset[]): string[] => {
    const fileTypes = assetList
      .map(asset => (asset.fileType || '').toUpperCase())
      .filter(type => type && type !== 'UNKNOWN')
      .filter((type, index, array) => array.indexOf(type) === index)
      .sort();

    return fileTypes;
  };

  const updateAvailableFileTypes = (assetList: DamAsset[]) => {
    const fileTypes = extractFileTypes(assetList);
    setAvailableFileTypes(fileTypes);
  };

  const fetchAssets = useCallback(async (
    params: AssetSearchParams = { limit: 100, offset: 0 }
  ) => {
    setIsLoading(true);
    setError(null);
  
  try {
    debugger;
    console.log("Loaded Fetch Assets.....");
    const url = actions[SEARCH_ASSETS_ACTION];
    const response = await actionWebInvoke(
      url,
      auth?.imsToken,
      auth?.imsOrg,
      params
    );
    // const imsToken = "eyJhbGciOiJSUzI1NiIsIng1dSI6Imltc19uYTEta2V5LWF0LTEuY2VyIiwia2lkIjoiaW1zX25hMS1rZXktYXQtMSIsIml0dCI6ImF0In0.eyJpZCI6IjE3NTY0MjEwMzY0OTZfN2NkZDc2NjUtNGQxMC00MDQ3LTk3OTItOTA1ZGE0MzZhNmQxX3V3MiIsInR5cGUiOiJhY2Nlc3NfdG9rZW4iLCJjbGllbnRfaWQiOiJleGNfYXBwIiwidXNlcl9pZCI6IjNGOEYyMjczNjg3MTlENzgwQTQ5NUM5RUA1Y2EzNjQzNjY2YjY4YzdjNDk1ZmZkLmUiLCJzdGF0ZSI6IntcInNlc3Npb25cIjpcImh0dHBzOi8vaW1zLW5hMS5hZG9iZWxvZ2luLmNvbS9pbXMvc2Vzc2lvbi92MS9aRFExT0RFeE1EQXROekUzT1MwME9XUXpMV0ptWldZdFpqZGpNemhrTXpZeFl6UmhMUzB4T0VVNU1qSXdOelk0TXpkQ01EQXhNRUUwT1RWRFJEaEFZV1J2WW1VdVkyOXRcIn0iLCJhcyI6Imltcy1uYTEiLCJhYV9pZCI6IjE4RTkyMjA3NjgzN0IwMDEwQTQ5NUNEOEBhZG9iZS5jb20iLCJjdHAiOjAsImZnIjoiWlhXVEdET0VWTE01SUhVS0hNUVZLN0FBV0k9PT09PT0iLCJzaWQiOiIxNzU2NDIxMDM1NTEzXzAxMDdiZDVmLTNiNWMtNDdjOS05ZGNhLTRkNTQxODc2MjM5Ml91dzIiLCJtb2kiOiI3OWNlNDJkOSIsInBiYSI6Ik1lZFNlY05vRVYsTG93U2VjIiwiZXhwaXJlc19pbiI6Ijg2NDAwMDAwIiwic2NvcGUiOiJhYi5tYW5hZ2UsYWNjb3VudF9jbHVzdGVyLnJlYWQsYWRkaXRpb25hbF9pbmZvLGFkZGl0aW9uYWxfaW5mby5qb2JfZnVuY3Rpb24sYWRkaXRpb25hbF9pbmZvLnByb2plY3RlZFByb2R1Y3RDb250ZXh0LGFkZGl0aW9uYWxfaW5mby5yb2xlcyxBZG9iZUlELGFkb2JlaW8uYXBwcmVnaXN0cnkucmVhZCxhZG9iZWlvX2FwaSxhZW0uZnJvbnRlbmQuYWxsLGF1ZGllbmNlbWFuYWdlcl9hcGksY3JlYXRpdmVfY2xvdWQsbXBzLG9wZW5pZCxvcmcucmVhZCxwcHMucmVhZCxyZWFkX29yZ2FuaXphdGlvbnMscmVhZF9wYyxyZWFkX3BjLmFjcCxyZWFkX3BjLmRtYV90YXJ0YW4sc2VydmljZV9wcmluY2lwYWxzLndyaXRlLHNlc3Npb24iLCJjcmVhdGVkX2F0IjoiMTc1NjQyMTAzNjQ5NiJ9.Z514-3BOkprlT8-Sz1LJv4o3PKNwPSZddKdPSxruX_jTt-sQGXK5I6e83ikHNF5oOrCUHUtabJ0vtJvIUP0t75pPmrf2fV6vpuQnEB-FnuoW3tGJpwmKfngrnysu55yfUc60WgQTyulbkHBgYWDdODJ9A2zva56dlGT1KYhm2wA_dXGsBqW_Z0zFDMqC-rUqLgdydlaLUrKTO4Wx-9RAdzUEN-Y-maAb_1iaciGVA4F3kcse_22B2D1thk_YtlQ0qqgOoYF_iUCd0Xhmntd65E81KP7MnWQGSvIzN8hfJnwKGF_wV8uWs57P0ECal0JUH_SkE-bcTmetfJ7W0_LU0g";
    //const imsToken = "eyJhbGciOiJSUzI1NiIsIng1dSI6Imltc19uYTEtc3RnMS1rZXktYXQtMS5jZXIiLCJraWQiOiJpbXNfbmExLXN0ZzEta2V5LWF0LTEiLCJpdHQiOiJhdCJ9.eyJpZCI6IjE3NTY0MDE5MjUyMTRfMjcwYjJhYzQtODQ5ZC00YzI0LTk2ZWYtMTNjYjU5M2E3MmZiX3V3MiIsInR5cGUiOiJhY2Nlc3NfdG9rZW4iLCJjbGllbnRfaWQiOiJleGNfYXBwIiwidXNlcl9pZCI6IjhGMUExRTI0Njg0OEJDNDkwQTQ5NDAyNEA0ODBiMWEzZTY2OWU5N2Y5NDk0MjM3LmUiLCJzdGF0ZSI6IntcInNlc3Npb25cIjpcImh0dHBzOi8vaW1zLW5hMS1zdGcxLmFkb2JlbG9naW4uY29tL2ltcy9zZXNzaW9uL3YxL01EVmlNbU01TlRVdE1qSTBOUzAwTkRsbUxXRmlNREF0TlRRNU5UaG1OelZsWlROaExTMDRSakZCTVVVeU5EWTRORGhDUXpRNU1FRTBPVFF3TWpSQU5EZ3dZakZoTTJVMk5qbGxPVGRtT1RRNU5ESXpOeTVsXCJ9IiwiYXMiOiJpbXMtbmExLXN0ZzEiLCJhYV9pZCI6IkFBNEUxREI2NjgzN0FEQ0MwQTQ5NDIwQUBjNjJmMjRjYzViNWI3ZTBlMGE0OTQwMDQiLCJjdHAiOjAsImZnIjoiWlhWN0tET0U1WjZYQjREWjNHWk1BMklBNlE9PT09PT0iLCJzaWQiOiIxNzU2MzIwMjEzNjMzXzFhMDdiY2ZmLWJkNmItNGY4OS1iYmRiLWRhOTUzYmFkNjAzZl91dzIiLCJtb2kiOiJlZTE0ZTU4NiIsInBiYSI6Ik1lZFNlY05vRVYsTG93U2VjIiwiZXhwaXJlc19pbiI6Ijg2NDAwMDAwIiwic2NvcGUiOiJhYi5tYW5hZ2UsYWNjb3VudF9jbHVzdGVyLnJlYWQsYWRkaXRpb25hbF9pbmZvLGFkZGl0aW9uYWxfaW5mby5qb2JfZnVuY3Rpb24sYWRkaXRpb25hbF9pbmZvLnByb2plY3RlZFByb2R1Y3RDb250ZXh0LGFkZGl0aW9uYWxfaW5mby5yb2xlcyxBZG9iZUlELGFkb2JlaW8uYXBwcmVnaXN0cnkucmVhZCxhZG9iZWlvX2FwaSxhZW0uZnJvbnRlbmQuYWxsLGF1ZGllbmNlbWFuYWdlcl9hcGksY3JlYXRpdmVfY2xvdWQsbXBzLG9wZW5pZCxvcmcucmVhZCxwcHMucmVhZCxyZWFkX29yZ2FuaXphdGlvbnMscmVhZF9wYyxyZWFkX3BjLmFjcCxyZWFkX3BjLmRtYV90YXJ0YW4sc2VydmljZV9wcmluY2lwYWxzLndyaXRlLHNlc3Npb24iLCJjcmVhdGVkX2F0IjoiMTc1NjQwMTkyNTIxNCJ9.B6DCYAM8fOGJunpPB7hDjrJZHoJqxWJuGzQcxl60IYi_XXT82AR3zoUlKp6gz0Wzg4OZ5EkKCoooTB68heS694s4nXke6YGL7hg6d4acpmhMC-dsnZDd2e2NtcbQg4lKpJnvMGEDOshGrOh3s_ltabRMDybRr20zb0H2zI0p7W3LtGlzEqCdU8pUCU0z5RjAIzdQemfeLBPw4IS5uV0y3p4UYFYSNniezLxxhFmTq3iZhF0sh5TvGfdKzpoJhVXuY-b86_I8nBap9wJ9tYEtzKfrzmYx89cZE4FV0CjTeUpBXJg1JXHpBQ3dvamXQLIpu0U75HzgavxYeZQ5vz2xzA";
    //const imsToken = "eyJhbGciOiJSUzI1NiIsIng1dSI6Imltc19uYTEtc3RnMS1rZXktYXQtMS5jZXIiLCJraWQiOiJpbXNfbmExLXN0ZzEta2V5LWF0LTEiLCJpdHQiOiJhdCJ9.eyJpZCI6IjE3NTY0MDE5MjUyMTRfMjcwYjJhYzQtODQ5ZC00YzI0LTk2ZWYtMTNjYjU5M2E3MmZiX3V3MiIsInR5cGUiOiJhY2Nlc3NfdG9rZW4iLCJjbGllbnRfaWQiOiJleGNfYXBwIiwidXNlcl9pZCI6IjhGMUExRTI0Njg0OEJDNDkwQTQ5NDAyNEA0ODBiMWEzZTY2OWU5N2Y5NDk0MjM3LmUiLCJzdGF0ZSI6IntcInNlc3Npb25cIjpcImh0dHBzOi8vaW1zLW5hMS1zdGcxLmFkb2JlbG9naW4uY29tL2ltcy9zZXNzaW9uL3YxL01EVmlNbU01TlRVdE1qSTBOUzAwTkRsbUxXRmlNREF0TlRRNU5UaG1OelZsWlROaExTMDRSakZCTVVVeU5EWTRORGhDUXpRNU1FRTBPVFF3TWpSQU5EZ3dZakZoTTJVMk5qbGxPVGRtT1RRNU5ESXpOeTVsXCJ9IiwiYXMiOiJpbXMtbmExLXN0ZzEiLCJhYV9pZCI6IkFBNEUxREI2NjgzN0FEQ0MwQTQ5NDIwQUBjNjJmMjRjYzViNWI3ZTBlMGE0OTQwMDQiLCJjdHAiOjAsImZnIjoiWlhWN0tET0U1WjZYQjREWjNHWk1BMklBNlE9PT09PT0iLCJzaWQiOiIxNzU2MzIwMjEzNjMzXzFhMDdiY2ZmLWJkNmItNGY4OS1iYmRiLWRhOTUzYmFkNjAzZl91dzIiLCJtb2kiOiJlZTE0ZTU4NiIsInBiYSI6Ik1lZFNlY05vRVYsTG93U2VjIiwiZXhwaXJlc19pbiI6Ijg2NDAwMDAwIiwic2NvcGUiOiJhYi5tYW5hZ2UsYWNjb3VudF9jbHVzdGVyLnJlYWQsYWRkaXRpb25hbF9pbmZvLGFkZGl0aW9uYWxfaW5mby5qb2JfZnVuY3Rpb24sYWRkaXRpb25hbF9pbmZvLnByb2plY3RlZFByb2R1Y3RDb250ZXh0LGFkZGl0aW9uYWxfaW5mby5yb2xlcyxBZG9iZUlELGFkb2JlaW8uYXBwcmVnaXN0cnkucmVhZCxhZG9iZWlvX2FwaSxhZW0uZnJvbnRlbmQuYWxsLGF1ZGllbmNlbWFuYWdlcl9hcGksY3JlYXRpdmVfY2xvdWQsbXBzLG9wZW5pZCxvcmcucmVhZCxwcHMucmVhZCxyZWFkX29yZ2FuaXphdGlvbnMscmVhZF9wYyxyZWFkX3BjLmFjcCxyZWFkX3BjLmRtYV90YXJ0YW4sc2VydmljZV9wcmluY2lwYWxzLndyaXRlLHNlc3Npb24iLCJjcmVhdGVkX2F0IjoiMTc1NjQwMTkyNTIxNCJ9.B6DCYAM8fOGJunpPB7hDjrJZHoJqxWJuGzQcxl60IYi_XXT82AR3zoUlKp6gz0Wzg4OZ5EkKCoooTB68heS694s4nXke6YGL7hg6d4acpmhMC-dsnZDd2e2NtcbQg4lKpJnvMGEDOshGrOh3s_ltabRMDybRr20zb0H2zI0p7W3LtGlzEqCdU8pUCU0z5RjAIzdQemfeLBPw4IS5uV0y3p4UYFYSNniezLxxhFmTq3iZhF0sh5TvGfdKzpoJhVXuY-b86_I8nBap9wJ9tYEtzKfrzmYx89cZE4FV0CjTeUpBXJg1JXHpBQ3dvamXQLIpu0U75HzgavxYeZQ5vz2xzA";
    //const imsToken = "eyJhbGciOiJSUzI1NiIsIng1dSI6Imltc19uYTEtc3RnMS1rZXktYXQtMS5jZXIiLCJraWQiOiJpbXNfbmExLXN0ZzEta2V5LWF0LTEiLCJpdHQiOiJhdCJ9.eyJpZCI6IjE3NTYzMjAyMTM2MzlfOWQ0YzI1ZWUtY2RkZS00ZDc2LTkzNzQtNWQ4ZDBjNjg4OGI0X3V3MiIsInR5cGUiOiJhY2Nlc3NfdG9rZW4iLCJjbGllbnRfaWQiOiJleGNfYXBwIiwidXNlcl9pZCI6IjhGMUExRTI0Njg0OEJDNDkwQTQ5NDAyNEA0ODBiMWEzZTY2OWU5N2Y5NDk0MjM3LmUiLCJzdGF0ZSI6IntcImpzbGlidmVyXCI6XCJ2Mi12MC4zMS4wLTItZzFlOGE4YThcIixcIm5vbmNlXCI6XCIzODk5NDUzMzUzMTgwNjY1XCIsXCJzZXNzaW9uXCI6XCJodHRwczovL2ltcy1uYTEtc3RnMS5hZG9iZWxvZ2luLmNvbS9pbXMvc2Vzc2lvbi92MS9NRFZpTW1NNU5UVXRNakkwTlMwME5EbG1MV0ZpTURBdE5UUTVOVGhtTnpWbFpUTmhMUzA0UmpGQk1VVXlORFk0TkRoQ1F6UTVNRUUwT1RRd01qUkFORGd3WWpGaE0yVTJOamxsT1RkbU9UUTVOREl6Tnk1bFwifSIsImFzIjoiaW1zLW5hMS1zdGcxIiwiYWFfaWQiOiJBQTRFMURCNjY4MzdBRENDMEE0OTQyMEFAYzYyZjI0Y2M1YjViN2UwZTBhNDk0MDA0IiwiY3RwIjowLCJmZyI6IlpYUkVDWENFNVo2WEI0RFozR1pNQTJJQTZRIiwic2lkIjoiMTc1NjMyMDIxMzYzM18xYTA3YmNmZi1iZDZiLTRmODktYmJkYi1kYTk1M2JhZDYwM2ZfdXcyIiwibW9pIjoiY2NiYzVlMTMiLCJwYmEiOiJNZWRTZWNOb0VWLExvd1NlYyIsImV4cGlyZXNfaW4iOiI4NjQwMDAwMCIsImNyZWF0ZWRfYXQiOiIxNzU2MzIwMjEzNjM5Iiwic2NvcGUiOiJhYi5tYW5hZ2UsYWNjb3VudF9jbHVzdGVyLnJlYWQsYWRkaXRpb25hbF9pbmZvLGFkZGl0aW9uYWxfaW5mby5qb2JfZnVuY3Rpb24sYWRkaXRpb25hbF9pbmZvLnByb2plY3RlZFByb2R1Y3RDb250ZXh0LGFkZGl0aW9uYWxfaW5mby5yb2xlcyxBZG9iZUlELGFkb2JlaW8uYXBwcmVnaXN0cnkucmVhZCxhZG9iZWlvX2FwaSxhZW0uZnJvbnRlbmQuYWxsLGF1ZGllbmNlbWFuYWdlcl9hcGksY3JlYXRpdmVfY2xvdWQsbXBzLG9wZW5pZCxvcmcucmVhZCxwcHMucmVhZCxyZWFkX29yZ2FuaXphdGlvbnMscmVhZF9wYyxyZWFkX3BjLmFjcCxyZWFkX3BjLmRtYV90YXJ0YW4sc2VydmljZV9wcmluY2lwYWxzLndyaXRlLHNlc3Npb24ifQ.fJGYudYHpKkx_TB1pZ9wvYkKjnBR6_Ezv7QdHeQejDTjN2LJw83qJ06G2JWv8iKbz2IBrZqGuL3GwdiaNRWRv9CN65EOYhtKuLTkEKGNCGsjjIuYDaBzAA_-JO0YahUZKb2MBw08U1mdgvBppDzKnQjkN-U5UMtJxiOeptvO6n0z-9EBaaJRx0G5HaIswsQ86gwAAUY_cZs2S0qW1WNVKpMrJ-vEunQgK9SdqqGdLBIe08309GS1VDMp225pOknyYWPlkcVW648FNb8dQMjzCwe044PLOJ5Revll3aLEgqEYP_jxPqqJdrl7XjDrtYzV2L1IRIIdcTMNqCcZySlZpA";
    // const imsOrg = "36031A56669DEACD0A49402F@AdobeOrg";
    // const response = await actionWebInvoke(
    //   url,
    //   imsToken,
    //   imsOrg,
    //   params
    // );
    if (response && typeof response === "object" && "assets" in response) {
      const validatedAssets = (response.assets as any[]).map(asset => ({
        id: asset.id || '',
        name: asset.name || 'Unknown',
        fileType: asset.fileType || 'UNKNOWN',
        thumbnailUrl: asset.thumbnailUrl || asset.url || '',
        url: asset.url || '',
        metadata: asset.metadata || {},
        dateCreated: asset.dateCreated || new Date().toISOString(),
        dateModified: asset.dateModified || new Date().toISOString(),
      }));
      if (Array.isArray(validatedAssets) && validatedAssets.length > 0) {
        setBaseAssets(validatedAssets);
        setDisplayedAssets(validatedAssets);
        if (response.availableFileTypes && Array.isArray(response.availableFileTypes)) {
          setAvailableFileTypes(response.availableFileTypes);
        } else {
          updateAvailableFileTypes(validatedAssets);
        }
      } else {
        // Fallback to mock assets when API returns empty
        const mockAssets = getMockAssets();
        setBaseAssets(mockAssets);
        setDisplayedAssets(mockAssets);
        updateAvailableFileTypes(mockAssets);
      }
    } else {
      debugger;
      const mockAssets = getMockAssets();
      setBaseAssets(mockAssets);
      setDisplayedAssets(mockAssets);
      updateAvailableFileTypes(mockAssets);
    }
  } catch (err) {
    console.warn("Error fetching assets:", err);
    setError("Failed to fetch assets. Please try again.");
    const mockAssets = getMockAssets();
    setBaseAssets(mockAssets);
    setDisplayedAssets(mockAssets);
    updateAvailableFileTypes(mockAssets);
  } finally {
    setIsLoading(false);
  }
}, [auth]);

const applySearchAndFilter = (searchTerm: string = "", fileTypes: string[] = []) => {
  let filteredAssets = baseAssets;

  if (searchTerm.trim()) {
    filteredAssets = baseAssets.filter((asset) => {
      const name = asset.name || '';
      const assetFileType = asset.fileType || '';
      const keywords = asset.metadata?.keywords || [];

      return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assetFileType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (Array.isArray(keywords) &&
          keywords.some((keyword: string) =>
            typeof keyword === 'string' && keyword.toLowerCase().includes(searchTerm.toLowerCase())
          ));
    });
  }

  if (fileTypes.length > 0) {
    filteredAssets = filteredAssets.filter((asset) => {
      const assetFileType = (asset.fileType || '').toUpperCase();
      return fileTypes.some(type => type.toUpperCase() === assetFileType);
    });
  }

  setDisplayedAssets(filteredAssets);
};

const searchAssets = (query: string) => {
  applySearchAndFilter(query, []);
};

const filterAssets = (fileTypes: string[] = [], currentSearchTerm: string = "") => {
  applySearchAndFilter(currentSearchTerm, fileTypes);
};

const resetToBaseAssets = () => {
  setDisplayedAssets(baseAssets);
};

// Add a local HTML file as an in-app asset
const addLocalHtmlAsset = async (file: File) => {
  const text = await file.text();
  const dataUrl = "data:text/html;charset=utf-8," + encodeURIComponent(text);
  const asset: DamAsset = {
    id: "local-" + Date.now(),
    name: file.name || "sample.html",
    fileType: "HTML",
    thumbnailUrl: placeholderThumb,
    url: dataUrl,
    metadata: { size: file.size, keywords: ["html", "local", "upload"] },
    dateCreated: new Date().toISOString(),
    dateModified: new Date().toISOString(),
  };
  const next = [asset, ...baseAssets];
  setBaseAssets(next);
  setDisplayedAssets([asset, ...displayedAssets]);
  updateAvailableFileTypes(next);
};

// Get a presigned URL for an asset
const getAssetPresignedUrl = async (
  assetId: string
): Promise<string | null> => {
  try {
    if (!auth) {
      throw new Error("Authentication not found");
    }
    const response = await actionWebInvoke(
      actions[GET_ASSET_URL_ACTION],
      auth.imsToken,
      auth.imsOrg,
      { assetId }
    );

    if (response && typeof response === "object" && "url" in response) {
      return response.url as string;
    }
    return null;
  } catch (err) {
    console.error("Error getting asset URL:", err);
    setError("Failed to get asset URL. Please try again.");
    return null;
  }
};

// Get asset metadata
const getAssetMetadata = async (assetId: string) => {
  try {
    if (!auth) {
      throw new Error("Authentication not found");
    }
    const response = await actionWebInvoke(
      actions[GET_ASSET_METADATA_ACTION],
      auth.imsToken,
      auth.imsOrg,
      { assetId }
    );

    if (response && typeof response === "object" && "metadata" in response) {
      return response.metadata;
    }
    return null;
  } catch (err) {
    console.error("Error getting asset metadata:", err);
    setError("Failed to get asset metadata. Please try again.");
    return null;
  }
};

// Helper function to generate mock assets for development
const getMockAssets = (): DamAsset[] => {
  const placeholderThumb = "https://via.placeholder.com/160x120?text=HTML";

  const makeHtmlDataUrl = (title: string, body: string) => {
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title></head><body><h1 style="font-family:Arial,sans-serif">${title}</h1><p style="font-family:Arial,sans-serif">${body}</p></body></html>`;
    return `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
  };

  const names = [
    "sample-landing.html",
    "offer-page.html",
    "email-template.html",
    "promo-banner.html",
    "legal-copy.html"
  ];

  const mockAssets: DamAsset[] = names.map((name, index) => ({
    id: `asset-${index + 1}`,
    name,
    fileType: "HTML",
    thumbnailUrl: placeholderThumb,
    url: makeHtmlDataUrl(name, "This is a mock HTML asset used for development."),
    metadata: {
      keywords: ["html", "mock", "template", "demo"],
    },
    dateCreated: new Date().toISOString(),
    dateModified: new Date().toISOString(),
  }));

  return mockAssets;
};

return {
  assets: displayedAssets,
  availableFileTypes,
  isLoading,
  error,
  fetchAssets,
  searchAssets,
  filterAssets,
  getAssetPresignedUrl,
  getAssetMetadata,
  resetToBaseAssets,
  addLocalHtmlAsset,
};
};
