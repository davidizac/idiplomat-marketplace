/**
 * API Hooks
 * React hooks for marketplace API data fetching
 */

import { useQuery } from "@tanstack/react-query";
import type { CategoriesResponse, Category, ListingsResponse } from "./types";

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

async function fetchJson<T>(url: string): Promise<T> {
	const response = await fetch(url);

	if (!response.ok) {
		throw new Error(`Request failed with status ${response.status}`);
	}

	return response.json() as Promise<T>;
}

function toQueryString(params: Record<string, any>): string {
	const searchParams = new URLSearchParams();

	for (const [key, value] of Object.entries(params)) {
		if (value === undefined || value === null || value === "") {
			continue;
		}

		if (Array.isArray(value)) {
			if (key === "attributeFilters") {
				searchParams.set(key, JSON.stringify(value));
				continue;
			}

			for (const item of value) {
				searchParams.append(key, String(item));
			}
			continue;
		}

		if (typeof value === "object") {
			searchParams.set(key, JSON.stringify(value));
			continue;
		}

		searchParams.set(key, String(value));
	}

	return searchParams.toString();
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
		queryFn: () =>
			fetchJson<CategoriesResponse>(
				`/api/marketplace/categories?${toQueryString(enhancedParams)}`,
			),
		enabled,
		// Prevent refetching on window focus to reduce unnecessary API calls
		refetchOnWindowFocus: false,
		// Keep data fresh for 5 minutes since categories don't change often
		staleTime: 5 * 60 * 1000, // 5 minutes
		// Cache data for 10 minutes even when component unmounts
		gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
		// Retry failed requests only once
		retry: 1,
		// Don't refetch on reconnect unless data is stale
		refetchOnReconnect: false,
	});
}

/**
 * Hook to fetch a single category by slug
 */
export function useCategoryBySlug(slug: string | undefined, enabled = true) {
	return useQuery({
		queryKey: [CATEGORIES_KEY, "slug", slug],
		queryFn: () =>
			fetchJson<Category>(
				`/api/marketplace/categories?${toQueryString({ slug })}`,
			),
		enabled: Boolean(slug) && enabled,
		// Prevent refetching on window focus to reduce unnecessary API calls
		refetchOnWindowFocus: false,
		// Keep data fresh for 5 minutes since categories don't change often
		staleTime: 5 * 60 * 1000, // 5 minutes
		// Cache data for 10 minutes even when component unmounts
		gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
		// Retry failed requests only once
		retry: 1,
		// Don't refetch on reconnect unless data is stale
		refetchOnReconnect: false,
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
		queryFn: () =>
			fetchJson<ListingsResponse>(
				`/api/marketplace/listings?${toQueryString(restParams)}`,
			),
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
		refetchOnReconnect: false,
	});
}
