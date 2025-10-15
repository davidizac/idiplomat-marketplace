"use client";

import type { Category } from "@repo/cms";
import { Button } from "@ui/components/button";
import { cn } from "@ui/lib";
import { X } from "lucide-react";

interface SubcategoryChipsProps {
	subcategories: Category[];
	selectedSubcategory: Category | null;
	onSelectSubcategory: (subcategory: Category | null) => void;
}

export function SubcategoryChips({
	subcategories,
	selectedSubcategory,
	onSelectSubcategory,
}: SubcategoryChipsProps) {
	if (!subcategories || subcategories.length === 0) {
		return null;
	}

	return (
		<div className="flex flex-wrap gap-2 items-center">
			<span className="text-sm font-medium text-muted-foreground">
				Subcategories:
			</span>

			{/* All Subcategories Chip */}
			<Button
				variant={!selectedSubcategory ? "default" : "outline"}
				size="sm"
				className={cn(
					"rounded-full h-8 px-4",
					!selectedSubcategory &&
						"bg-primary text-primary-foreground",
				)}
				onClick={() => onSelectSubcategory(null)}
			>
				All
			</Button>

			{/* Individual Subcategory Chips */}
			{subcategories.map((subcategory) => {
				const isSelected =
					selectedSubcategory?.documentId === subcategory.documentId;

				return (
					<Button
						key={subcategory.documentId}
						variant={isSelected ? "default" : "outline"}
						size="sm"
						className={cn(
							"rounded-full h-8 px-4 gap-1",
							isSelected && "bg-primary text-primary-foreground",
						)}
						onClick={() =>
							isSelected
								? onSelectSubcategory(null)
								: onSelectSubcategory(subcategory)
						}
					>
						{subcategory.name}
						{isSelected && <X className="h-3 w-3 ml-1" />}
					</Button>
				);
			})}
		</div>
	);
}
