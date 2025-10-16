"use client";

import type { Category, FilterManager } from "@repo/cms";
import { Button } from "@ui/components/button";
import { Card } from "@ui/components/card";
import { Separator } from "@ui/components/separator";
import { useEffect, useState } from "react";
import { AttributesManager } from "../../components/AttributesManager";
import type { AttributeValue } from "./filters/AttributeFilter";
import { CategoryButtonFilter } from "./filters/CategoryButtonFilter";
import { CityFilter } from "./filters/CityFilter";
import { PriceRangeFilter } from "./filters/PriceRangeFilter";
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
	selectedCategory: Category | null;
	onUpdateAttributeFilter: (
		attributeDocumentId: string,
		attributeName: string,
		value: AttributeValue,
	) => void;
	onUpdateCategory: (category: Category | null) => void;
	onUpdateSubcategory: (subcategory: Category | null) => void;
	onUpdateSearch: (searchTerm: string | null) => void;
	onUpdateAddress: (address: string | null) => void;
	onUpdatePriceRange: (range: [number, number]) => void;
	onClearFilters: () => void;
}

export function ListingsSidebar({
	filterManager,
	selectedCategory,
	onUpdateAttributeFilter,
	onUpdateCategory,
	onUpdateSubcategory,
	onUpdateSearch,
	onUpdateAddress,
	onUpdatePriceRange,
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

	// Update selected categories when the category prop changes
	useEffect(() => {
		if (selectedCategory) {
			setSelectedCategories([
				{
					slug: selectedCategory.slug,
					name: selectedCategory.name,
					documentId: selectedCategory.documentId,
					level: 0,
				},
			]);
		} else {
			setSelectedCategories([]);
		}
	}, [selectedCategory]);

	// Handle category selection
	const handleCategorySelect = (category: Category | null) => {
		if (category) {
			// Update the selected categories for attributes
			setSelectedCategories([
				{
					slug: category.slug,
					name: category.name,
					documentId: category.documentId,
					level: 0,
				},
			]);
		} else {
			// Clear all selected categories
			setSelectedCategories([]);
		}

		// Clear subcategory when category changes
		onUpdateSubcategory(null);
		// Notify parent component
		onUpdateCategory(category);
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

	// Get current price range from FilterManager
	const getCurrentPriceRange = (): [number, number] => {
		const priceFilter = filterManager.getFilter("priceRange");
		if (
			priceFilter?.value &&
			typeof priceFilter.value === "object" &&
			"min" in priceFilter.value &&
			"max" in priceFilter.value
		) {
			const { min, max } = priceFilter.value as {
				min: number;
				max: number;
			};
			return [min, max];
		}
		return [0, 10000]; // Default range
	};

	return (
		<Card className="h-fit w-full md:w-72 lg:w-80 flex-shrink-0 p-4 md:p-6">
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

				{/* Price Range Filter */}
				<PriceRangeFilter
					initialRange={getCurrentPriceRange()}
					onChange={onUpdatePriceRange}
					maxPrice={10000}
				/>

				<Separator />

				{/* Dynamic attribute filters based on selected categories */}
				{selectedCategories.length > 0 && (
					<>
						<AttributesManager
							selectedCategories={selectedCategories}
							isFilter={true}
							getAttributeValue={getAttributeValue}
							onChange={onUpdateAttributeFilter}
						/>
						<Separator />
					</>
				)}

				{/* Category Button Filter */}
				<CategoryButtonFilter
					selectedCategory={selectedCategory}
					onSelectCategory={handleCategorySelect}
				/>

				<div className="space-y-2 pt-2">
					<Button
						className="w-full"
						onClick={onClearFilters}
						variant="outline"
					>
						Reset Filters
					</Button>
				</div>
			</div>
		</Card>
	);
}
