/**
 * useFilterManager hook
 * A React hook for managing filters with the FilterManager
 */

import { FilterManager, toStrapiQuery } from "@repo/cms";
import { useCallback, useMemo, useState } from "react";
import type { AttributeValue } from "../components/filters/AttributeFilter";
import type { SortOption } from "../components/filters/SortFilter";
/**
 * A hook for managing filters with the FilterManager
 */
export function useFilterManager(initialFilters?: {
	categorySlug?: string | null;
	subcategorySlug?: string | null;
	subcategorySlugs?: string[] | null;
	sortOption?: SortOption;
	search?: string | null;
	address?: string | null;
	priceRange?: { min: number; max: number } | null;
	attributeValues?: Record<string, AttributeValue>;
}) {
	// Create filter manager instance with initial filters applied
	const [filterManager] = useState(() => {
		const manager = new FilterManager();

		// Apply initial filters immediately during creation
		if (initialFilters) {
			if (initialFilters.categorySlug) {
				manager.setCategoryFilter(initialFilters.categorySlug);
			}

			if (initialFilters.subcategorySlug) {
				manager.setSubcategoryFilter(initialFilters.subcategorySlug);
			}

			if (initialFilters.subcategorySlugs) {
				manager.setSubcategoriesFilter(initialFilters.subcategorySlugs);
			}

			if (initialFilters.sortOption) {
				manager.setSortFilter(initialFilters.sortOption);
			}

			if (initialFilters.search) {
				manager.setSearchFilter(initialFilters.search);
			}

			if (initialFilters.address) {
				manager.setAddressFilter(initialFilters.address);
			}

			if (initialFilters.priceRange) {
				manager.setPriceRangeFilter(
					initialFilters.priceRange.min,
					initialFilters.priceRange.max,
				);
			}

			// Set initial attribute values
			if (initialFilters.attributeValues) {
				Object.entries(initialFilters.attributeValues).forEach(
					([attributeDocumentId, value]) => {
						if (value !== undefined && value !== null) {
							const attrName = attributeDocumentId;
							manager.addAttributeFilter(
								attributeDocumentId,
								attrName,
								value,
							);
						}
					},
				);
			}
		}

		return manager;
	});

	// State to track when filters change
	const [filterVersion, setFilterVersion] = useState(0);

	// Handler for updating an attribute filter
	const updateAttributeFilter = useCallback(
		(
			attributeDocumentId: string,
			attributeName: string,
			value: AttributeValue,
		) => {
			console.log(
				"[useFilterManager] updateAttributeFilter called:",
				JSON.stringify(
					{
						attributeDocumentId,
						attributeName,
						value,
						timestamp: new Date().toISOString(),
					},
					null,
					2,
				),
			);
			console.log("Stack trace:", new Error().stack);
			filterManager.addAttributeFilter(
				attributeDocumentId,
				attributeName,
				value,
			);
			setFilterVersion((v) => v + 1);
		},
		[filterManager],
	);

	// Handler for updating sort option
	const updateSort = useCallback(
		(sortOption: SortOption) => {
			console.log(
				"[useFilterManager] updateSort called:",
				JSON.stringify(
					{
						sortOption,
						timestamp: new Date().toISOString(),
					},
					null,
					2,
				),
			);
			console.log("Stack trace:", new Error().stack);
			filterManager.setSortFilter(sortOption);
			setFilterVersion((v) => v + 1);
		},
		[filterManager],
	);

	// Handler for updating category
	const updateCategory = useCallback(
		(categorySlug: string | null) => {
			console.log(
				"[useFilterManager] updateCategory called:",
				JSON.stringify(
					{
						categorySlug,
						timestamp: new Date().toISOString(),
					},
					null,
					2,
				),
			);
			console.log("Stack trace:", new Error().stack);
			filterManager.setCategoryFilter(categorySlug);
			setFilterVersion((v) => v + 1);
		},
		[filterManager],
	);

	// Handler for updating subcategory
	const updateSubcategory = useCallback(
		(subcategorySlug: string | null) => {
			filterManager.setSubcategoryFilter(subcategorySlug);
			setFilterVersion((v) => v + 1);
		},
		[filterManager],
	);

	// Handler for updating subcategories
	const updateSubcategories = useCallback(
		(subcategorySlugs: string[] | null) => {
			filterManager.setSubcategoriesFilter(subcategorySlugs);
			setFilterVersion((v) => v + 1);
		},
		[filterManager],
	);

	// Handler for updating price range
	const updatePriceRange = useCallback(
		(min: number | null, max: number | null) => {
			console.log(
				"[useFilterManager] updatePriceRange called:",
				JSON.stringify(
					{
						min,
						max,
						timestamp: new Date().toISOString(),
					},
					null,
					2,
				),
			);
			console.log("Stack trace:", new Error().stack);
			filterManager.setPriceRangeFilter(min, max);
			setFilterVersion((v) => v + 1);
		},
		[filterManager],
	);

	// Handler for updating search term
	const updateSearch = useCallback(
		(searchTerm: string | null) => {
			console.log(
				"[useFilterManager] updateSearch called:",
				JSON.stringify(
					{
						searchTerm,
						timestamp: new Date().toISOString(),
					},
					null,
					2,
				),
			);
			console.log("Stack trace:", new Error().stack);
			filterManager.setSearchFilter(searchTerm);
			setFilterVersion((v) => v + 1);
		},
		[filterManager],
	);

	// Handler for updating city filter
	const updateAddress = useCallback(
		(address: string | null) => {
			console.log(
				"[useFilterManager] updateAddress called:",
				JSON.stringify(
					{
						address,
						timestamp: new Date().toISOString(),
					},
					null,
					2,
				),
			);
			console.log("Stack trace:", new Error().stack);
			filterManager.setAddressFilter(address);
			setFilterVersion((v) => v + 1);
		},
		[filterManager],
	);

	// Handler for clearing all filters
	const clearAllFilters = useCallback(() => {
		filterManager.clearFilters();
		setFilterVersion((v) => v + 1);
	}, [filterManager]);

	// Convert filters to Strapi query params - memoize to prevent unnecessary recalculations
	const strapiQuery = useMemo(() => {
		const query = toStrapiQuery(filterManager);
		console.log(
			"[useFilterManager] strapiQuery generated:",
			JSON.stringify(
				{
					filterVersion,
					query,
					timestamp: new Date().toISOString(),
				},
				null,
				2,
			),
		);
		return query;
	}, [filterVersion]); // filterManager is a stable reference from useState, no need to include it

	return {
		filterManager,
		strapiQuery,
		updateAttributeFilter,
		updateSort,
		updateCategory,
		updateSubcategory,
		updateSubcategories,
		updatePriceRange,
		updateSearch,
		updateAddress,
		clearAllFilters,
		filterVersion,
		setFilterVersion,
	};
}
