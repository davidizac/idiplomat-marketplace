/**
 * API Hooks
 * React hooks for API data fetching using the CMS package
 */

import { categoryService, listingService } from "@repo/cms";
import { useQuery } from "@tanstack/react-query";

// Query keys
const CATEGORIES_KEY = "marketplace-categories";
const LISTINGS_KEY = "marketplace-listings";

/**
 * Hook to fetch categories from Strapi
 */
export function useCategories(
	params: {
		page?: number;
		pageSize?: number;
		sort?: string;
		filters?: Record<string, any>;
		enabled?: boolean;
	} = {},
) {
	const { enabled = true, ...restParams } = params;

	// Make sure we're populating the categories relationship for subcategories
	const enhancedParams = {
		...restParams,
		populate: ["categories"], // Include subcategories
	};

	return useQuery({
		queryKey: [CATEGORIES_KEY, enhancedParams],
		queryFn: () => categoryService.getCategories(enhancedParams),
		enabled,
	});
}

/**
 * Hook to fetch a single category by slug
 */
export function useCategoryBySlug(slug: string | undefined, enabled = true) {
	return useQuery({
		queryKey: [CATEGORIES_KEY, "slug", slug],
		queryFn: () => categoryService.getCategoryBySlug(slug as string),
		enabled: Boolean(slug) && enabled,
	});
}

/**
 * Hook to fetch listings from Strapi
 */
export function useListings(
	params: {
		page?: number;
		pageSize?: number;
		sort?: string;
		subCategories?: string[];
		/** Optional category slug to filter listings */
		category?: string;
		attributeFilters?: Array<{
			attribute: string;
			value: string;
			operator?: "and" | "or";
		}>;
		enabled?: boolean;
	} = {},
) {
	const { enabled = true, ...restParams } = params;

	return useQuery({
		queryKey: [LISTINGS_KEY, restParams],
		queryFn: () => listingService.getListings(restParams),
		enabled,
	});
}
