"use client";

import type { Category } from "@repo/cms";
import { useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { CategorySelector } from "../../../../marketplace/components/CategorySelector";

interface HierarchicalCategoryFilterProps {
	onSelectCategory: (category: Category | null) => void;
	onSelectSubcategory: (subcategory: Category | null) => void;
}

export function HierarchicalCategoryFilter({
	onSelectCategory,
	onSelectSubcategory,
}: HierarchicalCategoryFilterProps) {
	const params = useSearchParams(); // Handle category selection at different levels
	console.log(params.get("category"));
	const handleCategorySelect = useCallback(
		(level: number, category: Category | null) => {
			if (level === 0) {
				onSelectCategory(category);
			} else {
				onSelectSubcategory(category);
			}
		},
		[onSelectCategory, onSelectSubcategory],
	);

	return (
		<CategorySelector
			label="Categories"
			allowSelectAll={true}
			showSelectionPath={true}
			levelLabels={{
				root: "Select Category",
				subcategory: "Subcategories",
			}}
			placeholders={{
				root: "All Categories",
				subcategory: "All Subcategories",
			}}
			onCategorySelect={handleCategorySelect}
		/>
	);
}
