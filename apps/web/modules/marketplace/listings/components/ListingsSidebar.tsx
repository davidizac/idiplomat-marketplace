"use client";

import { Button } from "@ui/components/button";
import { Card } from "@ui/components/card";
import { useEffect, useState } from "react";
import type { CategoryData } from "../../api/types";
import { CategoryFilter } from "./filters/CategoryFilter";
import { ConditionFilter } from "./filters/ConditionFilter";
import { LocationFilter } from "./filters/LocationFilter";
import { PriceRangeFilter } from "./filters/PriceRangeFilter";
import type { SortOption } from "./filters/SortFilter";

export interface FilterState {
	categories: string[];
	priceRange: [number, number];
	location: string;
	conditions: string[];
	sort: SortOption;
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
		categories: [],
		priceRange: [0, 5000],
		location: "all",
		conditions: [],
		sort: "newest",
	};

	// Initialize state with defaults + any provided initial values
	const [filters, setFilters] = useState<FilterState>({
		...defaultFilters,
		...initialFilters,
	});

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

	const handleApply = () => {
		onChange(filters);
	};

	const handleReset = () => {
		const resetFilters = { ...defaultFilters };
		setFilters(resetFilters);
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

				<CategoryFilter
					selectedCategories={filters.categories}
					onChange={(value) => updateFilter("categories", value)}
				/>

				<div className="h-[1px] w-full bg-border" />

				<PriceRangeFilter
					initialRange={filters.priceRange}
					onChange={(value) => updateFilter("priceRange", value)}
					maxPrice={10000}
				/>

				<div className="h-[1px] w-full bg-border" />

				<LocationFilter
					selectedLocation={filters.location}
					onChange={(value) => updateFilter("location", value)}
				/>

				<div className="h-[1px] w-full bg-border" />

				<ConditionFilter
					selectedConditions={filters.conditions}
					onChange={(value) => updateFilter("conditions", value)}
				/>

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
