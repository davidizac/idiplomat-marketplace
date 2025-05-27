"use client";

import type { Category, FilterManager } from "@repo/cms";
import { Button } from "@ui/components/button";
import { Card } from "@ui/components/card";
import { useState } from "react";
import { AttributesManager } from "../../components/AttributesManager";
import type { AttributeValue } from "./filters/AttributeFilter";
import { CityFilter } from "./filters/CityFilter";
import { HierarchicalCategoryFilter } from "./filters/HierarchicalCategoryFilter";
import { SearchFilter } from "./filters/SearchFilter";
import type { SortOption } from "./filters/SortFilter";

// Legacy filter state interface for backward compatibility
export interface SidebarFilters {
	sort?: SortOption;
	attributes?: Record<string, AttributeValue>;
	subcategories?: string[] | null;
}

interface ListingsSidebarProps {
	filterManager: FilterManager;
	onUpdateAttributeFilter: (
		attributeDocumentId: string,
		attributeName: string,
		value: AttributeValue,
	) => void;
	onUpdateCategory: (category: Category | null) => void;
	onUpdateSubcategory: (subcategory: Category | null) => void;
	onUpdateSearch: (searchTerm: string | null) => void;
	onUpdateAddress: (address: string | null) => void;
	onClearFilters: () => void;
}

export function ListingsSidebar({
	filterManager,
	onUpdateAttributeFilter,
	onUpdateCategory,
	onUpdateSubcategory,
	onUpdateSearch,
	onUpdateAddress,
	onClearFilters,
}: ListingsSidebarProps) {
	// Selected categories state (for attributes display)
	const [selectedCategories, setSelectedCategories] = useState<
		Array<{
			slug: string;
			name: string;
			documentId: string;
			level: number;
		}>
	>([]);

	// Handle category selection
	const handleCategorySelect = (category: Category | null) => {
		if (category) {
			// Update the selected categories for attributes
			setSelectedCategories((prev) => {
				// Find if we already have a level 0 category
				const hasPrimary = prev.some((cat) => cat.level === 0);

				if (hasPrimary) {
					// Replace the primary category and remove any subcategories
					return [
						{
							slug: category.slug,
							name: category.name,
							documentId: category.documentId,
							level: 0,
						},
					];
				}

				// Add as the primary category
				return [
					...prev,
					{
						slug: category.slug,
						name: category.name,
						documentId: category.documentId,
						level: 0,
					},
				];
			});
		} else {
			// Clear all selected categories
			setSelectedCategories([]);
		}

		// Notify parent component
		onUpdateCategory(category);
	};

	// Handle subcategory selection
	const handleSubcategorySelect = (subcategory: Category | null) => {
		if (subcategory) {
			// Update the selected categories for attributes
			setSelectedCategories((prev) => {
				// Filter out any existing subcategories (level > 0)
				const withoutSubcategories = prev.filter(
					(cat) => cat.level === 0,
				);

				// Add the new subcategory
				return [
					...withoutSubcategories,
					{
						slug: subcategory.slug,
						name: subcategory.name,
						documentId: subcategory.documentId,
						level: 1,
					},
				];
			});
		} else {
			// Remove subcategories, keep primary category
			setSelectedCategories((prev) =>
				prev.filter((cat) => cat.level === 0),
			);
		}

		// Notify parent component
		onUpdateSubcategory(subcategory);
	};

	// Get attribute values from FilterManager for display
	const getAttributeValue = (attributeDocumentId: string): AttributeValue => {
		const filterId = attributeDocumentId;
		const filter = filterManager.getFilter(filterId);

		if (filter) {
			// Return the filter value based on the type
			if (
				filter.valueType === "date" &&
				typeof filter.value === "string"
			) {
				// Convert string date back to Date object for the UI
				return new Date(filter.value);
			}

			return filter.value as AttributeValue;
		}

		return null;
	};

	// Get current search value from FilterManager
	const getCurrentSearchValue = (): string | null => {
		const searchFilter = filterManager.getFilter("search");
		return searchFilter ? (searchFilter.value as string) : null;
	};

	// Get current address value from FilterManager
	const getCurrentAddressValue = (): string | null => {
		const addressFilter = filterManager.getFilter("address");
		return addressFilter ? (addressFilter.value as string) : null;
	};

	return (
		<Card className="h-fit w-64 flex-shrink-0 p-6">
			<div className="space-y-6">
				{/* Search Filter */}
				<SearchFilter
					value={getCurrentSearchValue()}
					onSearch={onUpdateSearch}
				/>

				{/* City Filter */}
				<CityFilter
					value={getCurrentAddressValue()}
					onChange={onUpdateAddress}
					label="City"
				/>

				{/* Hierarchical Category Filter */}
				<HierarchicalCategoryFilter
					onSelectCategory={handleCategorySelect}
					onSelectSubcategory={handleSubcategorySelect}
				/>

				{/* Dynamic attribute filters based on selected categories */}
				{selectedCategories.length > 0 && (
					<AttributesManager
						selectedCategories={selectedCategories}
						isFilter={true}
						getAttributeValue={getAttributeValue}
						onChange={onUpdateAttributeFilter}
					/>
				)}

				<div className="space-y-2 pt-2">
					<Button className="w-full" onClick={onClearFilters}>
						Reset Filters
					</Button>
				</div>
			</div>
		</Card>
	);
}
