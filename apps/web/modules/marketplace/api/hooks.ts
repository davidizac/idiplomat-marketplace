/**
 * API Hooks
 * React hooks for API data fetching using the CMS package
 */

import {
	getCategories,
	getCategoryById,
	getCategoryBySlug,
	getListingById,
	getListingBySlug,
	getListings,
} from "@repo/cms/services";
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

	return useQuery({
		queryKey: [CATEGORIES_KEY, restParams],
		queryFn: () => getCategories(restParams),
		enabled,
	});
}

/**
 * Hook to fetch a single category by ID
 */
export function useCategoryById(
	id: string | number | undefined,
	enabled = true,
) {
	return useQuery({
		queryKey: [CATEGORIES_KEY, id],
		queryFn: () => getCategoryById(id as string | number),
		enabled: Boolean(id) && enabled,
	});
}

/**
 * Hook to fetch a single category by slug
 */
export function useCategoryBySlug(slug: string | undefined, enabled = true) {
	return useQuery({
		queryKey: [CATEGORIES_KEY, "slug", slug],
		queryFn: () => getCategoryBySlug(slug as string),
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
		queryFn: () => getListings(restParams),
		enabled,
	});
}

/**
 * Hook to fetch a single listing by ID
 */
export function useListingById(
	id: string | number | undefined,
	enabled = true,
) {
	return useQuery({
		queryKey: [LISTINGS_KEY, id],
		queryFn: () => getListingById(id as string | number),
		enabled: Boolean(id) && enabled,
	});
}

/**
 * Hook to fetch a single listing by slug
 */
export function useListingBySlug(slug: string | undefined, enabled = true) {
	return useQuery({
		queryKey: [LISTINGS_KEY, "slug", slug],
		queryFn: () => getListingBySlug(slug as string),
		enabled: Boolean(slug) && enabled,
	});
}
