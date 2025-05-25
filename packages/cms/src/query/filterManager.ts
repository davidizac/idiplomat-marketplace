/**
 * FilterManager
 * Centralized filter management system for CMS filtering
 */

import type { FilterOperator } from "./filters";

// Filter types
export type FilterValueType =
	| string
	| number
	| boolean
	| Date
	| string[]
	| null
	| number[];

// Attribute value types that can be used for filtering
export type FilterAttributeValue =
	| string
	| string[]
	| number
	| boolean
	| Date
	| null;

// Filter definition for a single filter
export interface FilterDefinition {
	field: string;
	operator: FilterOperator;
	value: FilterValueType;
	valueType?: "text" | "number" | "boolean" | "date" | "multi-select";
	isAttributeFilter?: boolean;
}

export class FilterManager {
	private filters: Map<string, FilterDefinition> = new Map();

	/**
	 * Add a filter to the filter manager
	 */
	addFilter(id: string, filter: FilterDefinition): FilterManager {
		this.filters.set(id, filter);
		return this;
	}

	/**
	 * Remove a filter from the filter manager
	 */
	removeFilter(id: string): FilterManager {
		this.filters.delete(id);
		return this;
	}

	/**
	 * Update an existing filter
	 */
	updateFilter(
		id: string,
		updates: Partial<FilterDefinition>,
	): FilterManager {
		const existingFilter = this.filters.get(id);
		if (existingFilter) {
			this.filters.set(id, { ...existingFilter, ...updates });
		}
		return this;
	}

	/**
	 * Clear all filters
	 */
	clearFilters(): FilterManager {
		this.filters.clear();
		return this;
	}

	/**
	 * Get all filters
	 */
	getFilters(): Map<string, FilterDefinition> {
		return this.filters;
	}

	/**
	 * Get a specific filter by ID
	 */
	getFilter(id: string): FilterDefinition | undefined {
		return this.filters.get(id);
	}

	/**
	 * Add or update attribute filter
	 */
	addAttributeFilter(
		attributeDocumentId: string,
		attributeName: string,
		value: FilterAttributeValue,
		operator: FilterOperator = "eq",
	): FilterManager {
		const id = attributeDocumentId;

		// Skip empty values
		if (
			value === null ||
			value === undefined ||
			value === "" ||
			(Array.isArray(value) && value.length === 0)
		) {
			// Remove the filter if it exists
			return this.removeFilter(id);
		}

		// Determine value type based on the value
		let valueType: "text" | "number" | "boolean" | "date" | "multi-select" =
			"text";

		// Convert value to appropriate type for filter
		let filterValue: FilterValueType = "";

		if (typeof value === "number") {
			valueType = "number";
			filterValue = value;
		} else if (typeof value === "boolean") {
			valueType = "boolean";
			filterValue = value;
		} else if (value instanceof Date) {
			valueType = "date";
			// Convert date to ISO string for filtering
			filterValue = value.toISOString();
		} else if (Array.isArray(value)) {
			valueType = "multi-select";
			filterValue = value;
		} else {
			// String or other value type
			filterValue = String(value);
		}

		// Create filter definition
		const filterDefinition: FilterDefinition = {
			field: attributeName,
			operator,
			value: filterValue,
			valueType,
			isAttributeFilter: true,
		};

		return this.addFilter(id, filterDefinition);
	}

	/**
	 * Set category filter
	 */
	setCategoryFilter(categorySlug: string | null): FilterManager {
		if (categorySlug) {
			return this.addFilter("category", {
				field: "category",
				operator: "eq",
				value: categorySlug,
			});
		}

		return this.removeFilter("category");
	}

	/**
	 * Set subcategory filter
	 */
	setSubcategoryFilter(subcategorySlug: string | null): FilterManager {
		if (subcategorySlug) {
			return this.addFilter("subcategory", {
				field: "subcategory",
				operator: "eq",
				value: subcategorySlug,
			});
		}

		return this.removeFilter("subcategory");
	}

	/**
	 * Set subcategories filter (multiple subcategories)
	 */
	setSubcategoriesFilter(subcategorySlugs: string[] | null): FilterManager {
		if (subcategorySlugs && subcategorySlugs.length > 0) {
			return this.addFilter("subcategories", {
				field: "subcategories",
				operator: "in",
				value: subcategorySlugs,
			});
		}

		return this.removeFilter("subcategories");
	}

	/**
	 * Set price range filter
	 */
	setPriceRangeFilter(min: number | null, max: number | null): FilterManager {
		if (min !== null || max !== null) {
			return this.addFilter("price_range", {
				field: "price",
				operator: "between",
				value: [min ?? 0, max ?? Number.MAX_SAFE_INTEGER],
				valueType: "number",
			});
		}

		return this.removeFilter("price_range");
	}

	/**
	 * Set sort filter
	 */
	setSortFilter(sortOption: string): FilterManager {
		return this.addFilter("sort", {
			field: "sort",
			operator: "eq",
			value: sortOption,
		});
	}

	/**
	 * Set search/keyword filter
	 */
	setSearchFilter(searchTerm: string | null): FilterManager {
		if (searchTerm && searchTerm.trim() !== "") {
			return this.addFilter("search", {
				field: "search",
				operator: "contains",
				value: searchTerm.trim(),
			});
		}

		return this.removeFilter("search");
	}
}
