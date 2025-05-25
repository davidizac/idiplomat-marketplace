/**
 * Marketplace Module Exports
 * Clean exports for the refactored marketplace components
 */

// Data Layer
export * from "./data/category-service";
export * from "./data/category-hooks";

// State Management
export * from "./state/category-context";

// Business Logic
export * from "./lib/attribute-utils";

// UI Components
export { CategorySelector } from "./components/CategorySelector/CategorySelector";
export { AttributeManager } from "./components/AttributeManager/AttributeManager";
export { AttributeField } from "./components/AttributeManager/AttributeField";

// Legacy components (for backward compatibility during migration)
export { CategorySelector as LegacyCategorySelector } from "./components/CategorySelector";
export { AttributesManager as LegacyAttributesManager } from "./components/AttributesManager";
