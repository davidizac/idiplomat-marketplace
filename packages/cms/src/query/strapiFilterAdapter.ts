/**
 * Strapi Filter Adapter
 * Converts the FilterManager to Strapi-compatible query parameters
 */

import type { ListingFilterParams } from "../types/listing";
import type { FilterDefinition, FilterManager } from "./filterManager";

/**
 * Convert FilterManager to Strapi query parameters
 */
export function toStrapiQuery(
	filterManager: FilterManager,
): ListingFilterParams {
	const params: ListingFilterParams = {
		page: 1,
		pageSize: 20,
	};

	const filters = filterManager.getFilters();
	const attributeFilters: Array<{
		attribute: string;
		value: string;
		operator?: "and" | "or";
	}> = [];

	// Process filters
	filters.forEach((filter, id) => {
		if (id === "sort") {
			// Handle sort
			params.sort = convertSort(filter.value as string);
		} else if (id === "search") {
			// Handle search/keyword filter
			params.search = filter.value as string;
		} else if (id === "address") {
			// Handle city filter
			params.address = filter.value as string;
		} else if (id === "category") {
			// Handle single category filter
			params.category = filter.value as string;
		} else if (id === "subcategory") {
			// Handle single subcategory filter
			params.subCategories = [filter.value as string];
		} else if (id === "subcategories") {
			// Handle subcategories
			params.subCategories = filter.value as string[];
		} else if (filter.isAttributeFilter) {
			// Handle attribute filters
			processAttributeFilter(filter, attributeFilters);
		}

		// Other filters like category, price range, etc. would be processed here
	});

	// Add attribute filters if any
	if (attributeFilters.length > 0) {
		params.attributeFilters = attributeFilters;
	}

	return params;
}

/**
 * Process an attribute filter and add it to the attributeFilters array
 */
function processAttributeFilter(
	filter: FilterDefinition,
	attributeFilters: Array<{
		attribute: string;
		value: string;
		operator?: "and" | "or";
	}>,
): void {
	// Get base values
	const attributeName = filter.field;
	const filterOperator = filter.operator === "or" ? "or" : "and";

	// Handle different value types
	if (Array.isArray(filter.value)) {
		// For multi-select or arrays, add each value with OR operator
		filter.value.forEach((value) => {
			attributeFilters.push({
				attribute: attributeName,
				value: String(value),
				operator: "or",
			});
		});
	} else {
		// Single value
		attributeFilters.push({
			attribute: attributeName,
			value: String(filter.value),
			operator: filterOperator,
		});
	}
}

/**
 * Convert sort option to Strapi format
 */
export function convertSort(sortOption: string): string {
	switch (sortOption) {
		case "price-low-high":
			return "price:asc";
		case "price-high-low":
			return "price:desc";
		case "newest":
			return "createdAt:desc";
		case "oldest":
			return "createdAt:asc";
		case "alphabetical":
			return "title:asc";
		default:
			return "createdAt:desc";
	}
}
