/**
 * Attribute Utilities
 * Pure functions for attribute operations and validation
 */

import type { CategoryNode } from "../data/category-service";

// Types
export type AttributeValue = string | string[] | number | boolean | Date | null;

export interface AttributeDefinition {
	id: string;
	documentId: string;
	name: string;
	type: "text" | "number" | "boolean" | "date" | "select" | "multi-select";
	required: boolean;
	options: string[];
	metadata: {
		minimum?: number;
		maximum?: number;
		step?: number;
		[key: string]: unknown;
	};
}

export interface AttributeState {
	definition: AttributeDefinition;
	value: AttributeValue;
	error?: string;
}

export interface AttributeFormData {
	attributeDocumentId: string;
	attributeName: string;
	value: AttributeValue;
}

/**
 * Get default value for an attribute type
 */
export function getDefaultAttributeValue(
	type: AttributeDefinition["type"],
): AttributeValue {
	switch (type) {
		case "text":
		case "select":
			return "";
		case "number":
			return 0;
		case "boolean":
			return false;
		case "date":
			return null;
		case "multi-select":
			return [];
		default:
			return null;
	}
}

/**
 * Validate an attribute value
 */
export function validateAttributeValue(
	value: AttributeValue,
	definition: AttributeDefinition,
): string | null {
	// Check required fields
	if (definition.required && isEmptyValue(value)) {
		return `${definition.name} is required`;
	}

	// Skip validation for empty optional fields
	if (!definition.required && isEmptyValue(value)) {
		return null;
	}

	// Type-specific validation
	switch (definition.type) {
		case "text":
			return validateTextValue(value as string, definition);
		case "number":
			return validateNumberValue(value as number, definition);
		case "select":
			return validateSelectValue(value as string, definition);
		case "multi-select":
			return validateMultiSelectValue(value as string[], definition);
		default:
			return null;
	}
}

/**
 * Check if a value is considered empty
 */
function isEmptyValue(value: AttributeValue): boolean {
	if (value === null || value === undefined) return true;
	if (typeof value === "string" && value.trim() === "") return true;
	if (Array.isArray(value) && value.length === 0) return true;
	return false;
}

/**
 * Validate text attribute value
 */
function validateTextValue(
	value: string,
	definition: AttributeDefinition,
): string | null {
	if (typeof value !== "string") {
		return `${definition.name} must be text`;
	}

	const minLength = definition.metadata.minLength as number;
	const maxLength = definition.metadata.maxLength as number;

	if (minLength && value.length < minLength) {
		return `${definition.name} must be at least ${minLength} characters`;
	}

	if (maxLength && value.length > maxLength) {
		return `${definition.name} must be no more than ${maxLength} characters`;
	}

	return null;
}

/**
 * Validate number attribute value
 */
function validateNumberValue(
	value: number,
	definition: AttributeDefinition,
): string | null {
	if (typeof value !== "number" || Number.isNaN(value)) {
		return `${definition.name} must be a valid number`;
	}

	const min = definition.metadata.minimum as number;
	const max = definition.metadata.maximum as number;

	if (min !== undefined && value < min) {
		return `${definition.name} must be at least ${min}`;
	}

	if (max !== undefined && value > max) {
		return `${definition.name} must be no more than ${max}`;
	}

	return null;
}

/**
 * Validate select attribute value
 */
function validateSelectValue(
	value: string,
	definition: AttributeDefinition,
): string | null {
	if (!definition.options.includes(value)) {
		return `${definition.name} must be one of: ${definition.options.join(", ")}`;
	}

	return null;
}

/**
 * Validate multi-select attribute value
 */
function validateMultiSelectValue(
	value: string[],
	definition: AttributeDefinition,
): string | null {
	if (!Array.isArray(value)) {
		return `${definition.name} must be an array`;
	}

	const invalidOptions = value.filter((v) => !definition.options.includes(v));
	if (invalidOptions.length > 0) {
		return `${definition.name} contains invalid options: ${invalidOptions.join(", ")}`;
	}

	return null;
}

/**
 * Convert category attributes to our normalized format
 */
export function transformCategoryAttributes(
	categories: CategoryNode[],
): AttributeDefinition[] {
	const attributesMap = new Map<string, AttributeDefinition>();

	categories.forEach((category) => {
		category.attributes.forEach((attr) => {
			attributesMap.set(attr.documentId, {
				id: attr.id,
				documentId: attr.documentId,
				name: attr.name,
				type: attr.type as AttributeDefinition["type"],
				required: attr.required,
				options: attr.options,
				metadata: attr.metadata as AttributeDefinition["metadata"],
			});
		});
	});

	return Array.from(attributesMap.values());
}

/**
 * Initialize attribute states from definitions
 */
export function initializeAttributeStates(
	definitions: AttributeDefinition[],
	initialValues?: Record<string, AttributeValue>,
): AttributeState[] {
	return definitions.map((definition) => ({
		definition,
		value:
			initialValues?.[definition.documentId] ??
			getDefaultAttributeValue(definition.type),
	}));
}

/**
 * Update attribute state
 */
export function updateAttributeState(
	states: AttributeState[],
	documentId: string,
	value: AttributeValue,
): AttributeState[] {
	return states.map((state) =>
		state.definition.documentId === documentId
			? {
					...state,
					value,
					error:
						validateAttributeValue(value, state.definition) ||
						undefined,
				}
			: state,
	);
}

/**
 * Convert attribute states to form data
 */
export function attributeStatesToFormData(
	states: AttributeState[],
): AttributeFormData[] {
	return states.map((state) => ({
		attributeDocumentId: state.definition.documentId,
		attributeName: state.definition.name,
		value: state.value,
	}));
}

/**
 * Check if all required attributes are valid
 */
export function validateAllAttributes(states: AttributeState[]): boolean {
	return states.every((state) => {
		const error = validateAttributeValue(state.value, state.definition);
		return !error;
	});
}

/**
 * Get attribute errors
 */
export function getAttributeErrors(
	states: AttributeState[],
): Record<string, string> {
	const errors: Record<string, string> = {};

	states.forEach((state) => {
		const error = validateAttributeValue(state.value, state.definition);
		if (error) {
			errors[state.definition.documentId] = error;
		}
	});

	return errors;
}
