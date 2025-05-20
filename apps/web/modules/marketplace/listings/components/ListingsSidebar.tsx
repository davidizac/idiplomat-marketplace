"use client";

import { Button } from "@ui/components/button";
import { Card } from "@ui/components/card";
import { useEffect, useState } from "react";
import type { CategoryData } from "../../api/types";
import {
	AttributeFilter,
	type AttributeFilterValues,
	type AttributeValue,
} from "./filters/AttributeFilter";
import type { SortOption } from "./filters/SortFilter";
import { SubcategoryFilter } from "./filters/SubcategoryFilter";

export interface FilterState {
	sort: SortOption;
	attributes?: AttributeFilterValues;
	subcategories?: string[] | null;
}

interface ListingsSidebarProps {
	onChange: (filters: FilterState) => void;
	initialFilters?: Partial<FilterState>;
	selectedCategory?: CategoryData;
}

export function ListingsSidebar({
	onChange,
	initialFilters = {},
	selectedCategory,
}: ListingsSidebarProps) {
	// Create default filters
	const defaultFilters: FilterState = {
		sort: "newest",
		attributes: {},
		subcategories: null,
	};

	// Initialize state with defaults + any provided initial values
	const [filters, setFilters] = useState<FilterState>({
		...defaultFilters,
		...initialFilters,
	});

	// Initialize attribute values
	const [attributeValues, setAttributeValues] =
		useState<AttributeFilterValues>(initialFilters.attributes || {});

	// Initialize subcategory value
	const [selectedSubcategory, setSelectedSubcategory] = useState<
		string | null
	>(
		initialFilters.subcategories && initialFilters.subcategories.length > 0
			? initialFilters.subcategories[0]
			: null,
	);

	// Update attribute filters whenever selected category changes
	useEffect(() => {
		if (selectedCategory?.attributes) {
			setAttributeValues((prevValues) => {
				// Initialize empty values for any new attributes
				const newAttributeValues = { ...prevValues };
				let hasNewAttributes = false;

				// Safe access to attributes with optional chaining
				selectedCategory?.attributes?.forEach((attr) => {
					if (!(attr.id in newAttributeValues)) {
						hasNewAttributes = true;
						// Set default values based on attribute type
						switch (attr.type) {
							case "text":
							case "select":
								newAttributeValues[attr.id] = "";
								break;
							case "number":
								newAttributeValues[attr.id] = 0;
								break;
							case "boolean":
								newAttributeValues[attr.id] = false;
								break;
							case "date":
								newAttributeValues[attr.id] = null;
								break;
							case "multi-select":
								newAttributeValues[attr.id] = [];
								break;
							default:
								newAttributeValues[attr.id] = null;
						}
					}
				});

				// Only return new values if we actually added new attributes
				return hasNewAttributes ? newAttributeValues : prevValues;
			});
		}
	}, [selectedCategory]); // Remove attributeValues from dependencies

	// Update local filters when props change (initial render only)
	useEffect(() => {
		if (Object.keys(initialFilters).length > 0) {
			setFilters((prev) => ({
				...prev,
				...initialFilters,
			}));
		}
	}, []); // Run only once on mount

	const updateFilter = <K extends keyof FilterState>(
		key: K,
		value: FilterState[K],
	) => {
		setFilters((prev) => ({
			...prev,
			[key]: value,
		}));
	};

	// Handler for attribute changes
	const handleAttributeChange = (
		attributeId: number,
		value: AttributeValue,
	) => {
		const newValues = {
			...attributeValues,
			[attributeId]: value,
		};
		setAttributeValues(newValues);
		updateFilter("attributes", newValues);
	};

	// Handler for subcategory changes
	const handleSubcategoryChange = (subcategorySlug: string | null) => {
		setSelectedSubcategory(subcategorySlug);
		updateFilter(
			"subcategories",
			subcategorySlug ? [subcategorySlug] : null,
		);
	};

	const handleApply = () => {
		onChange({
			...filters,
			attributes: attributeValues,
			subcategories: selectedSubcategory ? [selectedSubcategory] : null,
		});
	};

	const handleReset = () => {
		const resetFilters = { ...defaultFilters };
		setFilters(resetFilters);
		setAttributeValues({});
		setSelectedSubcategory(null);
		onChange(resetFilters);
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
						metadata={attribute.metadata}
						value={attributeValues[attribute.id] || null}
						onChange={handleAttributeChange}
					/>
				))}

				<div className="space-y-2 pt-2">
					<Button className="w-full" onClick={handleApply}>
						Apply Filters
					</Button>
					<Button
						variant="outline"
						className="w-full"
						onClick={handleReset}
					>
						Reset
					</Button>
				</div>
			</div>
		</Card>
	);
}
