/**
 * useFilterManager hook
 * A React hook for managing filters with the FilterManager
 */

import { FilterManager, toStrapiQuery } from "@repo/cms";
import { useCallback, useEffect, useState } from "react";
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
	attributeValues?: Record<string, AttributeValue>;
}) {
	// Create filter manager instance
	const [filterManager] = useState(() => new FilterManager());

	// State to track when filters change
	const [filterVersion, setFilterVersion] = useState(0);

	// Initialize filters
	useEffect(() => {
		if (!initialFilters) return;

		// Set initial filters
		if (initialFilters.categorySlug) {
			filterManager.setCategoryFilter(initialFilters.categorySlug);
		}

		if (initialFilters.subcategorySlug) {
			filterManager.setSubcategoryFilter(initialFilters.subcategorySlug);
		}

		if (initialFilters.subcategorySlugs) {
			filterManager.setSubcategoriesFilter(
				initialFilters.subcategorySlugs,
			);
		}

		if (initialFilters.sortOption) {
			filterManager.setSortFilter(initialFilters.sortOption);
		}

		// Set initial attribute values
		if (initialFilters.attributeValues) {
			Object.entries(initialFilters.attributeValues).forEach(
				([attributeId, value]) => {
					if (value !== undefined && value !== null) {
						const attrName = `attribute_${attributeId}`;
						filterManager.addAttributeFilter(
							attributeId,
							attrName,
							value,
						);
					}
				},
			);
		}

		// Update version to trigger a re-render
		setFilterVersion((v) => v + 1);
	}, [filterManager]);

	// Handler for updating an attribute filter
	const updateAttributeFilter = useCallback(
		(
			attributeId: number | string,
			attributeName: string,
			value: AttributeValue,
		) => {
			filterManager.addAttributeFilter(attributeId, attributeName, value);
			setFilterVersion((v) => v + 1);
		},
		[filterManager],
	);

	// Handler for updating sort option
	const updateSort = useCallback(
		(sortOption: SortOption) => {
			filterManager.setSortFilter(sortOption);
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
			filterManager.setPriceRangeFilter(min, max);
			setFilterVersion((v) => v + 1);
		},
		[filterManager],
	);

	// Handler for clearing all filters
	const clearAllFilters = useCallback(() => {
		filterManager.clearFilters();
		setFilterVersion((v) => v + 1);
	}, [filterManager]);

	// Convert filters to Strapi query params
	const strapiQuery = toStrapiQuery(filterManager);

	return {
		filterManager,
		strapiQuery,
		updateAttributeFilter,
		updateSort,
		updateSubcategory,
		updateSubcategories,
		updatePriceRange,
		clearAllFilters,
		filterVersion,
	};
}
