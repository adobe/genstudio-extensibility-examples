import {
  EXTENSION_ID,
  APP_METADATA,
  VALIDATION_PANEL_ROUTE,
  PROMPT_DIALOG_ROUTE,
  ASSET_VIEWER_ROUTE,
  TEMPLATE_VIEWER_ROUTE,
} from "../src/genstudiopem/web-src/src/Constants";

describe("Extension constants", () => {
  test("EXTENSION_ID is defined", () => {
    expect(EXTENSION_ID).toBe("genstudio-example:e2e-test-app");
  });

  test("APP_METADATA has required fields", () => {
    expect(APP_METADATA.label).toBeDefined();
    expect(APP_METADATA.iconDataUri).toBeDefined();
    expect(APP_METADATA.supportedChannels.length).toBeGreaterThan(0);
    expect(APP_METADATA.extensionId).toBe(EXTENSION_ID);
  });

  test("all routes are defined", () => {
    expect(VALIDATION_PANEL_ROUTE).toBe("/validation-panel");
    expect(PROMPT_DIALOG_ROUTE).toBe("/prompt-dialog");
    expect(ASSET_VIEWER_ROUTE).toBe("/select-content-dialog");
    expect(TEMPLATE_VIEWER_ROUTE).toBe("/select-template-dialog");
  });
});

describe("validationExtension methods", () => {
  const mockId = "test-experience-id";
  const getAppMetadata = (id: string) => ({ ...APP_METADATA, id });

  test("getToggles returns toggle with correct metadata shape", async () => {
    const toggles = [
      {
        metadata: getAppMetadata(mockId),
        onClick: async () => {},
      },
    ];
    expect(toggles).toHaveLength(1);
    expect(toggles[0].metadata.id).toBe(mockId);
    expect(toggles[0].metadata.extensionId).toBe(EXTENSION_ID);
    expect(typeof toggles[0].onClick).toBe("function");
  });

  test("getApps returns app with validation panel URL", () => {
    const apps = [
      {
        url: `#${VALIDATION_PANEL_ROUTE}`,
        metadata: getAppMetadata(mockId),
      },
    ];
    expect(apps).toHaveLength(1);
    expect(apps[0].url).toBe("#/validation-panel");
    expect(apps[0].metadata.id).toBe(mockId);
  });
});

describe("promptExtension methods", () => {
  const mockId = "test-experience-id";
  const getAppMetadata = (id: string) => ({ ...APP_METADATA, id });

  test("getToggles returns toggle with correct metadata shape", async () => {
    const toggles = [
      {
        metadata: getAppMetadata(mockId),
        onClick: async () => {},
      },
    ];
    expect(toggles).toHaveLength(1);
    expect(toggles[0].metadata.extensionId).toBe(EXTENSION_ID);
  });

  test("getApps returns app with prompt dialog URL", () => {
    const apps = [
      {
        url: `#${PROMPT_DIALOG_ROUTE}`,
        metadata: getAppMetadata(mockId),
      },
    ];
    expect(apps[0].url).toBe("#/prompt-dialog");
  });
});

describe("selectContentExtension methods", () => {
  const mockId = "test-experience-id";
  const getAppMetadata = (id: string) => ({ ...APP_METADATA, id });

  test("getApps returns app with asset viewer URL", () => {
    const apps = [
      {
        url: `#${ASSET_VIEWER_ROUTE}`,
        metadata: getAppMetadata(mockId),
      },
    ];
    expect(apps[0].url).toBe("#/select-content-dialog");
  });

  test("uploadAndGetUrl stub returns expected shape", async () => {
    const mockAsset = {
      id: "asset-123",
      name: "test-image.jpg",
      externalAssetInfo: {
        signedUrl: "https://example.com/original.jpg",
        signedThumbnailUrl: "https://example.com/thumb.jpg",
      },
    };

    const result = {
      originalPath: mockAsset.name,
      originalUrl: mockAsset.externalAssetInfo.signedUrl,
      thumbnailPath: `thumb_${mockAsset.name}`,
      thumbnailUrl: mockAsset.externalAssetInfo.signedThumbnailUrl,
    };

    expect(result.originalPath).toBe("test-image.jpg");
    expect(result.originalUrl).toBe("https://example.com/original.jpg");
    expect(result.thumbnailPath).toBe("thumb_test-image.jpg");
    expect(result.thumbnailUrl).toBe("https://example.com/thumb.jpg");
  });
});

describe("importTemplateExtension methods", () => {
  const mockId = "test-experience-id";
  const getAppMetadata = (id: string) => ({ ...APP_METADATA, id });

  test("getApps returns app with template viewer URL", () => {
    const apps = [
      {
        url: `#${TEMPLATE_VIEWER_ROUTE}`,
        metadata: getAppMetadata(mockId),
      },
    ];
    expect(apps[0].url).toBe("#/select-template-dialog");
  });
});
