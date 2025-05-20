"use client";

import type { Category, FilterManager } from "@repo/cms";
import { Button } from "@ui/components/button";
import { Card } from "@ui/components/card";
import { useEffect, useState } from "react";
import {
	AttributeFilter,
	type AttributeFilterValues,
	type AttributeValue,
} from "./filters/AttributeFilter";
import type { SortOption } from "./filters/SortFilter";
import { SubcategoryFilter } from "./filters/SubcategoryFilter";

// Legacy filter state interface for backward compatibility
export interface SidebarFilters {
	sort?: SortOption;
	attributes?: AttributeFilterValues;
	subcategories?: string[] | null;
}

interface ListingsSidebarProps {
	selectedCategory?: Category;
	filterManager: FilterManager;
	onUpdateAttributeFilter: (
		attributeId: number,
		attributeName: string,
		value: AttributeValue,
	) => void;
	onUpdateSubcategory: (subcategorySlug: string | null) => void;
	onClearFilters: () => void;
}

export function ListingsSidebar({
	selectedCategory,
	filterManager,
	onUpdateAttributeFilter,
	onUpdateSubcategory,
	onClearFilters,
}: ListingsSidebarProps) {
	// Selected subcategory state (derived from FilterManager)
	const [selectedSubcategory, setSelectedSubcategory] = useState<
		string | null
	>(null);

	// Get current subcategory from the FilterManager
	useEffect(() => {
		const subcategoryFilter = filterManager.getFilter("subcategory");
		if (subcategoryFilter) {
			setSelectedSubcategory(subcategoryFilter.value as string);
		} else {
			setSelectedSubcategory(null);
		}
	}, [filterManager]);

	// Handler for attribute changes
	const handleAttributeChange = (
		attributeId: number,
		value: AttributeValue,
	) => {
		const attributeName =
			selectedCategory?.attributes?.find(
				(attr) => attr.id === attributeId,
			)?.name || `attribute_${attributeId}`;

		onUpdateAttributeFilter(attributeId, attributeName, value);
	};

	// Handler for subcategory changes
	const handleSubcategoryChange = (subcategorySlug: string | null) => {
		setSelectedSubcategory(subcategorySlug);
		onUpdateSubcategory(subcategorySlug);
	};

	// Get attribute values from FilterManager for display
	const getAttributeValue = (attributeId: string): AttributeValue => {
		const filterId = `attr_${attributeId}`;
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

		// Return appropriate default value based on attribute type
		const attributeType = selectedCategory?.attributes?.find(
			(attr) => attr.id.toString() === attributeId,
		)?.type;

		switch (attributeType) {
			case "text":
			case "select":
				return "";
			case "number":
				return 0;
			case "boolean":
				return false;
			case "date":
				return null;
			case "multi-select":
				return [];
			default:
				return null;
		}
	};

	return (
		<Card className="h-fit w-64 flex-shrink-0 p-6">
			<div className="space-y-6">
				{selectedCategory && (
					<div className="pb-2">
						<h3 className="font-medium text-sm text-muted-foreground mb-1">
							Selected Category
						</h3>
						<div className="font-medium">
							{selectedCategory.name}
						</div>
					</div>
				)}

				{/* Show subcategory filter if the category has subcategories */}
				{selectedCategory && (
					<SubcategoryFilter
						parentCategory={selectedCategory}
						selectedSubcategory={selectedSubcategory}
						onChange={handleSubcategoryChange}
					/>
				)}

				{/* Dynamic attribute filters based on selected category */}
				{selectedCategory?.attributes?.map((attribute) => (
					<AttributeFilter
						key={attribute.id}
						attribute={attribute}
						value={getAttributeValue(attribute.id.toString())}
						onChange={handleAttributeChange}
					/>
				))}

				<div className="space-y-2 pt-2">
					<Button className="w-full" onClick={onClearFilters}>
						Reset Filters
					</Button>
				</div>
			</div>
		</Card>
	);
}
