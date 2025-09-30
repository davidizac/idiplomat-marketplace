"use client";

import type { Category } from "@repo/cms";
import { useSearchParams } from "next/navigation";
import { useCallback } from "react";
import {
	type SimpleCategorySelection,
	SimpleCategorySelector,
} from "../../../components/SimpleCategorySelector";

interface HierarchicalCategoryFilterProps {
	onSelectCategory: (category: Category | null) => void;
	onSelectSubcategory: (subcategory: Category | null) => void;
}

export function HierarchicalCategoryFilter({
	onSelectCategory,
	onSelectSubcategory,
}: HierarchicalCategoryFilterProps) {
	const searchParams = useSearchParams();
	const categorySlug = searchParams.get("category");
	const subcategorySlug = searchParams.get("subcategory");

	const handleChange = useCallback(
		(selection: SimpleCategorySelection) => {
			onSelectCategory(selection.primary);
			onSelectSubcategory(selection.subcategory);
		},
		[onSelectCategory, onSelectSubcategory],
	);

	return (
		<SimpleCategorySelector
			label="Categories"
			allowSelectAll={true}
			initialPrimarySlug={categorySlug}
			initialSubcategorySlug={subcategorySlug}
			onChange={handleChange}
		/>
	);
}
