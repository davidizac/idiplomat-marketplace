/**
 * Category Data Hooks
 * React Query hooks for category data fetching
 */

import { useQueries, useQuery } from "@tanstack/react-query";
import { categoryService } from "./category-service";
import type {} from "./category-service";

// Query keys factory
export const categoryQueryKeys = {
	all: ["categories"] as const,
	roots: () => [...categoryQueryKeys.all, "roots"] as const,
	bySlug: (slug: string) => [...categoryQueryKeys.all, "slug", slug] as const,
	path: (slug: string) => [...categoryQueryKeys.all, "path", slug] as const,
	attributes: (categorySlugs: string[]) =>
		[...categoryQueryKeys.all, "attributes", categorySlugs] as const,
};

/**
 * Hook to fetch root categories
 */
export function useRootCategories(options: { enabled?: boolean } = {}) {
	return useQuery({
		queryKey: categoryQueryKeys.roots(),
		queryFn: () => categoryService.getRootCategories(),
		staleTime: 5 * 60 * 1000, // 5 minutes
		...options,
	});
}

/**
 * Hook to fetch a category by slug
 */
export function useCategoryBySlug(
	slug: string | null,
	options: { enabled?: boolean } = {},
) {
	return useQuery({
		queryKey: categoryQueryKeys.bySlug(slug || ""),
		queryFn: () => categoryService.getCategoryBySlug(slug!),
		enabled: Boolean(slug) && (options.enabled ?? true),
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

/**
 * Hook to fetch multiple categories by slugs
 */
export function useCategoriesBySlug(
	slugs: string[],
	options: { enabled?: boolean } = {},
) {
	return useQueries({
		queries: slugs.map((slug) => ({
			queryKey: categoryQueryKeys.bySlug(slug),
			queryFn: () => categoryService.getCategoryBySlug(slug),
			enabled: Boolean(slug) && (options.enabled ?? true),
			staleTime: 5 * 60 * 1000,
		})),
	});
}

/**
 * Hook to fetch category path
 */
export function useCategoryPath(
	slug: string | null,
	options: { enabled?: boolean } = {},
) {
	return useQuery({
		queryKey: categoryQueryKeys.path(slug || ""),
		queryFn: () => categoryService.getCategoryPath(slug!),
		enabled: Boolean(slug) && (options.enabled ?? true),
		staleTime: 5 * 60 * 1000,
	});
}

/**
 * Hook to fetch attributes for multiple categories
 */
export function useCategoryAttributes(
	categorySlugs: string[],
	options: { enabled?: boolean } = {},
) {
	return useQuery({
		queryKey: categoryQueryKeys.attributes(categorySlugs),
		queryFn: () =>
			categoryService.getAttributesForCategories(categorySlugs),
		enabled: categorySlugs.length > 0 && (options.enabled ?? true),
		staleTime: 5 * 60 * 1000,
	});
}
