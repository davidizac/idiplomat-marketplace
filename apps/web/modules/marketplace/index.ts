/**
 * Marketplace Module Exports
 * Clean exports for the refactored marketplace components
 */

// Data Layer
export * from "./data/category-service";
export * from "./data/category-hooks";

// Business Logic
export * from "./lib/attribute-utils";

// UI Components
export {
	SimpleCategorySelector,
	type SimpleCategorySelection,
} from "./components/SimpleCategorySelector";
export { AttributesManager } from "./components/AttributesManager";
