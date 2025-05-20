"use client";

import { Label } from "@ui/components/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@ui/components/select";
import { useEffect, useState } from "react";
import type { CategoryData } from "../../../api/types";

interface SubcategoryFilterProps {
	parentCategory: CategoryData;
	selectedSubcategory: string | null;
	onChange: (subcategorySlug: string | null) => void;
}

export function SubcategoryFilter({
	parentCategory,
	selectedSubcategory,
	onChange,
}: SubcategoryFilterProps) {
	const [subcategories, setSubcategories] = useState<CategoryData[]>([]);

	// Load subcategories when the parent category changes
	useEffect(() => {
		if (
			parentCategory?.categories &&
			parentCategory.categories.length > 0
		) {
			setSubcategories(parentCategory.categories);
		} else {
			setSubcategories([]);
		}
	}, [parentCategory]);

	// If there are no subcategories, don't render anything
	if (!subcategories.length) {
		return null;
	}

	return (
		<div className="space-y-2">
			<Label htmlFor="subcategory">Subcategory</Label>
			<Select
				value={selectedSubcategory || ""}
				onValueChange={(value: string) =>
					onChange(value === "all" ? null : value)
				}
			>
				<SelectTrigger id="subcategory">
					<SelectValue placeholder="Select a subcategory" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="all">All Subcategories</SelectItem>
					{subcategories.map((subcategory) => (
						<SelectItem
							key={subcategory.id}
							value={subcategory.slug}
						>
							{subcategory.name}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}
