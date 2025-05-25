/**
 * Listing Filter Example
 * Demonstrates how to use the new refactored components together
 */

"use client";

import { Button } from "@ui/components/button";
import { Card } from "@ui/components/card";
import { useState } from "react";
import {
	AttributeManager,
	type AttributeValue,
	type CategoryNode,
	CategorySelectionProvider,
	CategorySelector,
} from "../index";

interface ListingFilterExampleProps {
	onFiltersChange?: (filters: {
		category: CategoryNode | null;
		subcategory: CategoryNode | null;
		attributes: Record<string, AttributeValue>;
	}) => void;
}

export function ListingFilterExample({
	onFiltersChange,
}: ListingFilterExampleProps) {
	// State for collecting filter values
	const [filters, setFilters] = useState<{
		category: CategoryNode | null;
		subcategory: CategoryNode | null;
		attributes: Record<string, AttributeValue>;
	}>({
		category: null,
		subcategory: null,
		attributes: {},
	});

	// Handle category selection changes
	const handleCategoryChange = (
		primary: CategoryNode | null,
		subcategory: CategoryNode | null,
	) => {
		const newFilters = {
			...filters,
			category: primary,
			subcategory,
			// Clear attributes when category changes
			attributes: {},
		};

		setFilters(newFilters);
		onFiltersChange?.(newFilters);
	};

	// Handle attribute filter changes
	const handleAttributeChange = (
		attributeDocumentId: string,
		attributeName: string,
		value: AttributeValue,
	) => {
		const newAttributes = {
			...filters.attributes,
			[attributeDocumentId]: value,
		};

		const newFilters = {
			...filters,
			attributes: newAttributes,
		};

		setFilters(newFilters);
		onFiltersChange?.(newFilters);
	};

	// Clear all filters
	const handleClearFilters = () => {
		const clearedFilters = {
			category: null,
			subcategory: null,
			attributes: {},
		};

		setFilters(clearedFilters);
		onFiltersChange?.(clearedFilters);
	};

	return (
		<CategorySelectionProvider>
			<Card className="p-6 w-80">
				<div className="space-y-6">
					{/* Category Selection */}
					<CategorySelector
						label="Filter by Category"
						allowSelectAll={true}
						onSelectionChange={handleCategoryChange}
					/>

					{/* Dynamic Attribute Filters */}
					<AttributeManager
						isFilter={true}
						onChange={handleAttributeChange}
						initialValues={filters.attributes}
					/>

					{/* Actions */}
					<div className="space-y-2 pt-4 border-t">
						<Button
							variant="outline"
							className="w-full"
							onClick={handleClearFilters}
						>
							Clear All Filters
						</Button>
					</div>

					{/* Debug: Show current filters */}
					{process.env.NODE_ENV === "development" && (
						<div className="text-xs text-muted-foreground bg-muted p-2 rounded">
							<pre>{JSON.stringify(filters, null, 2)}</pre>
						</div>
					)}
				</div>
			</Card>
		</CategorySelectionProvider>
	);
}
