/**
 * Strapi Filters
 * Common filter templates for Strapi queries
 */

// Filter operators for Strapi queries
export type FilterOperator =
	| "eq"
	| "ne"
	| "lt"
	| "lte"
	| "gt"
	| "gte"
	| "in"
	| "notIn"
	| "contains"
	| "notContains"
	| "containsi"
	| "notContainsi"
	| "null"
	| "notNull"
	| "between"
	| "or"
	| "and";

/**
 * Create an equals filter
 */
export function eq(field: string, value: string | number | boolean) {
	return { [field]: { $eq: value } };
}

/**
 * Create a not equals filter
 */
export function ne(field: string, value: string | number | boolean) {
	return { [field]: { $ne: value } };
}

/**
 * Create a contains filter
 */
export function contains(field: string, value: string) {
	return { [field]: { $contains: value } };
}

/**
 * Create a greater than filter
 */
export function gt(field: string, value: number | Date) {
	return { [field]: { $gt: value } };
}

/**
 * Create a greater than or equal filter
 */
export function gte(field: string, value: number | Date) {
	return { [field]: { $gte: value } };
}

/**
 * Create a less than filter
 */
export function lt(field: string, value: number | Date) {
	return { [field]: { $lt: value } };
}

/**
 * Create a less than or equal filter
 */
export function lte(field: string, value: number | Date) {
	return { [field]: { $lte: value } };
}

/**
 * Create an in filter
 */
export function isIn(field: string, values: (string | number)[]) {
	return { [field]: { $in: values } };
}

/**
 * Create a not in filter
 */
export function notIn(field: string, values: (string | number)[]) {
	return { [field]: { $notIn: values } };
}

/**
 * Create a between filter
 */
export function between(field: string, min: number | Date, max: number | Date) {
	return { [field]: { $gte: min, $lte: max } };
}

/**
 * Create a filter for a price range
 */
export const priceRange = (min?: number, max?: number) => {
	const filters: Record<string, any> = {};

	if (min !== undefined && max !== undefined) {
		filters.price = { $gte: min, $lte: max };
	} else if (min !== undefined) {
		filters.price = { $gte: min };
	} else if (max !== undefined) {
		filters.price = { $lte: max };
	}

	return filters;
};

/**
 * Create a filter for category
 */
export const byCategorySlug = (categorySlug: string) => {
	return {
		categories: {
			slug: { $eq: categorySlug },
		},
	};
};

/**
 * Create a filter for multiple categories (OR)
 */
export const byCategories = (categorySlugs: string[]) => {
	if (categorySlugs.length === 0) return {};
	if (categorySlugs.length === 1) return byCategorySlug(categorySlugs[0]);

	return {
		$or: categorySlugs.map((slug) => ({
			categories: {
				slug: { $eq: slug },
			},
		})),
	};
};
