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
 * Helper function to create stable query keys by filtering out Next.js internal parameters
 */
function createStableQueryKey(
	params: Record<string, any>,
): Record<string, any> {
	// Remove Next.js internal parameters that change on each request
	const { _rsc, _next, ...cleanParams } = params;

	// Filter out any other parameters that start with underscore (typically internal)
	const stableParams = Object.fromEntries(
		Object.entries(cleanParams).filter(([key]) => !key.startsWith("_")),
	);

	return stableParams;
}

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
		populate: ["categories", "icon"], // Include subcategories
	};

	return useQuery({
		queryKey: [CATEGORIES_KEY, createStableQueryKey(enhancedParams)],
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
		queryFn: async () => {
			// Log that we're fetching a category
			console.log(`API: Fetching category with slug: ${slug}`);

			// Get the category with deep population of subcategories
			const result = await categoryService.getCategoryBySlug(
				slug as string,
			);

			// Log the result for debugging
			console.log("API: Category result:", result);

			return result;
		},
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
		search?: string;
		author?: string | null;
	} = {},
) {
	const { enabled = true, ...restParams } = params;

	// Create a stable query key by filtering out Next.js internal parameters
	const stableParams = createStableQueryKey(restParams);

	return useQuery({
		queryKey: [LISTINGS_KEY, stableParams],
		queryFn: () => listingService.getListings(restParams),
		enabled,
		// Prevent refetching on window focus to reduce unnecessary API calls
		refetchOnWindowFocus: false,
		// Keep data fresh for 1 minute to reduce API calls for similar queries
		staleTime: 60 * 1000, // 1 minute
		// Cache data for 5 minutes even when component unmounts
		gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
		// Retry failed requests only once
		retry: 1,
		// Don't refetch on reconnect unless data is stale
		refetchOnReconnect: "always",
	});
}
