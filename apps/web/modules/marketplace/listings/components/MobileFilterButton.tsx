"use client";

import type { Category } from "@repo/cms";
import { Button } from "@ui/components/button";
import { Filter } from "lucide-react";

interface MobileFilterButtonProps {
	selectedCategory: Category | null;
	selectedSubcategory: Category | null;
	onClick: () => void;
}

export function MobileFilterButton({
	selectedCategory,
	selectedSubcategory,
	onClick,
}: MobileFilterButtonProps) {
	// Determine the button text based on selections
	const getButtonText = () => {
		if (selectedSubcategory) {
			return (
				<div className="flex flex-col items-start">
					<span className="text-xs text-muted-foreground font-normal">
						{selectedCategory?.name}
					</span>
					<span className="font-medium">
						{selectedSubcategory.name}
					</span>
				</div>
			);
		}
		if (selectedCategory) {
			return <span className="font-medium">{selectedCategory.name}</span>;
		}
		return <span className="font-medium">All Categories</span>;
	};

	return (
		<Button
			onClick={onClick}
			className="w-full justify-between gap-2 h-auto py-3"
			variant="outline"
		>
			<div className="flex items-center gap-2 min-w-0 flex-1">
				<Filter className="h-4 w-4 flex-shrink-0" />
				<div className="min-w-0 flex-1 text-left">
					{getButtonText()}
				</div>
			</div>
			<span className="text-xs text-muted-foreground whitespace-nowrap">
				Tap to change
			</span>
		</Button>
	);
}
