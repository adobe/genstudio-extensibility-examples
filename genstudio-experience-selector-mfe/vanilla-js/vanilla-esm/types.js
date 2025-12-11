/**
 * Represents a field within an Experience.
 * Each field contains a name and corresponding value.
 * @typedef {Object} ExperienceField
 * @property {string} fieldName - Name of the experience field
 * @property {string} fieldValue - Value associated with the experience field
 */

/**
 * Metadata describing the dimensions and aspect ratio of an experience aspect.
 * This type is derived from the Aspect interface in @genstudio/mfe-content-sdk.
 * @typedef {Object} AspectMetadata
 * @property {{width: number, height: number}} [dimensions] - Dimensions of the aspect (width and height in pixels)
 * @property {string} [aspectRatio] - Aspect ratio as a string (e.g., "1:1", "16:9", "4:5")
 */

/**
 * Represents a single aspect variant of an experience with its rendered HTML content
 * @typedef {Object} ExperienceAspectSelection
 * @property {string} aspectKey - Aspect key identifier (e.g., "1:1", "16:9", "4:5")
 * @property {AspectMetadata} aspectMetadata - Metadata associated with the aspect (width, height, ratio)
 * @property {string} content - Base64 encoded string of the HTML content rendered for this aspect
 */

/**
 * Metadata for an external asset from an extension/integration
 * @typedef {Object} ExternalAssetMetadataItem
 * @property {string} assetId - Asset identifier in the external system
 * @property {string} assetSourceUrl - Source URL of the asset
 * @property {string} assetSignedUrl - Signed URL for accessing the asset
 * @property {string} assetSignedPreviewUrl - Signed preview URL for the asset thumbnail
 * @property {string} extensionId - Extension identifier that provided this asset
 * @property {string} extensionSource - Human-readable name of the extension source
 * @property {string} extensionIconUrl - Base64 encoded icon URL for the extension
 * @property {string[]} keywords - Keywords associated with the asset
 * @property {boolean} isAssetDeliverable - Whether the asset is deliverable
 */

/**
 * Record of external asset metadata keyed by IMS organization identifiers
 * @typedef {Object.<string, ExternalAssetMetadataItem>} ExternalAssetMetadataRecord
 */

/**
 * Metadata for external templates
 * @typedef {Object} ExternalTemplateMetadata
 * @property {string} id - Template identifier
 * @property {string} extensionId - Extension identifier that provided this template
 * @property {Object.<string, string>} mapping - Mapping of template field names to GenStudio field names
 * @property {string} source - Human-readable name of the template source
 * @property {string} [url] - URL of the external template
 * @property {string[]} [keywords] - Keywords associated with the template
 * @property {Object.<string, *>} [additionalMetadata] - Additional arbitrary metadata for the template
 */

/**
 * Metadata associated with an experience.
 * Includes known fields with strong typing and allows arbitrary additional keys.
 * @typedef {Object} ExperienceMetadata
 * @property {string} channel - Channel identifier (e.g., "meta", "email", "display")
 * @property {string} [externalTemplateId] - External template identifier
 * @property {string} [externalTemplateSource] - Source of the external template
 * @property {string} [keywords] - Comma-separated keywords associated with the experience
 * @property {ExternalAssetMetadataRecord} [externalAssetMetadata] - External asset metadata keyed by IMS organization identifiers
 * @property {ExternalTemplateMetadata} [externalTemplateMetadata] - External template metadata with structure and field mappings
 */

/**
 * Represents a selected experience with its content, fields, metadata, and optional aspect variants.
 * @typedef {Object} ExperienceSelection
 * @property {string} id - Experience ID
 * @property {string} content - Base64 encoded string of the HTML content of the experience
 * @property {Object.<string, ExperienceField>} experienceFields - Collection of fields in experience stored as key-value pairs
 * @property {ExperienceMetadata} metadata - Metadata associated with the experience
 * @property {ExperienceAspectSelection[]} [aspectVariants] - Array of aspect variants with rendered HTML for each aspect ratio. Available when experience has multiple aspect ratios defined
 */
