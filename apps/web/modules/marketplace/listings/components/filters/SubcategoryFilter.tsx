"use client";

import type { Category } from "@repo/cms";
import { Label } from "@ui/components/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@ui/components/select";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

interface SubcategoryFilterProps {
	parentCategory: Category;
	selectedSubcategory: string | null;
	onChange: (subcategorySlug: string | null) => void;
}

export function SubcategoryFilter({
	parentCategory,
	selectedSubcategory,
	onChange,
}: SubcategoryFilterProps) {
	const t = useTranslations("marketplace.filters");
	const [subcategories, setSubcategories] = useState<Category[]>([]);

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
			<Label htmlFor="subcategory">{t("subcategory")}</Label>
			<Select
				value={selectedSubcategory || ""}
				onValueChange={(value: string) =>
					onChange(value === "all" ? null : value)
				}
			>
				<SelectTrigger id="subcategory">
					<SelectValue placeholder={t("selectSubcategory")} />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="all">{t("allSubcategories")}</SelectItem>
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
