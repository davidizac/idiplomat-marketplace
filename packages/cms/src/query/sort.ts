/**
 * Strapi Sort
 * Common sort configurations for Strapi queries
 */

// Sort directions
export type SortDirection = "asc" | "desc";

/**
 * Create a sort parameter
 */
export function createSort(
	field: string,
	direction: SortDirection = "asc",
): string {
	return `${field}:${direction}`;
}

/**
 * Newest first sort (by createdAt desc)
 */
export const NEWEST_FIRST = "createdAt:desc";

/**
 * Oldest first sort (by createdAt asc)
 */
export const OLDEST_FIRST = "createdAt:asc";

/**
 * Price low to high sort
 */
export const PRICE_LOW_TO_HIGH = "price:asc";

/**
 * Price high to low sort
 */
export const PRICE_HIGH_TO_LOW = "price:desc";

/**
 * Alphabetical sort (by title)
 */
export const ALPHABETICAL = "title:asc";

/**
 * Most popular sort (by views)
 */
export const MOST_POPULAR = "views:desc";

/**
 * Format for common listing sort options
 */
export const listingSortOptions = {
	newest: NEWEST_FIRST,
	oldest: OLDEST_FIRST,
	priceLowToHigh: PRICE_LOW_TO_HIGH,
	priceHighToLow: PRICE_HIGH_TO_LOW,
	alphabetical: ALPHABETICAL,
	popular: MOST_POPULAR,
};
