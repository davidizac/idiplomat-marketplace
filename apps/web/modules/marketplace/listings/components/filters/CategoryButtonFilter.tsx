"use client";

import { useCategories } from "@marketplace/api";
import type { Category } from "@repo/cms";
import { Button } from "@ui/components/button";
import { Label } from "@ui/components/label";
import { Skeleton } from "@ui/components/skeleton";
import { cn } from "@ui/lib";
import {
	Boxes,
	Car,
	Home,
	Laptop,
	type LucideIcon,
	ShoppingBag,
	Sofa,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";

interface CategoryButtonFilterProps {
	selectedCategory: Category | null;
	onSelectCategory: (category: Category | null) => void;
}

// Icon mapping for categories
const categoryIconMap: Record<string, LucideIcon> = {
	vehicles: Car,
	electronics: Laptop,
	furniture: Sofa,
	home: Home,
	shopping: ShoppingBag,
	default: Boxes,
};

function getCategoryIcon(category: Category): LucideIcon {
	const slug = category.slug.toLowerCase();
	return categoryIconMap[slug] || categoryIconMap.default;
}

export function CategoryButtonFilter({
	selectedCategory,
	onSelectCategory,
}: CategoryButtonFilterProps) {
	const t = useTranslations("marketplace.filters");
	// Fetch root categories (parent-level categories only)
	const { data, isLoading, isError } = useCategories({
		pageSize: 100,
	});

	// Filter root categories (those without a parent)
	const rootCategories =
		data?.data?.filter((category: Category) => !category.parent) || [];

	if (isLoading) {
		return (
			<div className="space-y-3">
				<Label className="text-sm font-semibold">{t("categories")}</Label>
				<div className="space-y-2">
					{Array.from({ length: 6 }).map((_, index) => (
						<Skeleton
							key={index}
							className="h-12 w-full rounded-md"
						/>
					))}
				</div>
			</div>
		);
	}

	if (isError) {
		return (
			<div className="space-y-3">
				<Label className="text-sm font-semibold">{t("categories")}</Label>
				<div className="text-sm text-destructive">
					{t("categoriesLoadError")}
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-3">
			<Label className="text-sm font-semibold">{t("categories")}</Label>
			<div className="space-y-2">
				{/* All Categories Button */}
				<Button
					variant={!selectedCategory ? "default" : "outline"}
					className={cn(
						"w-full justify-start gap-3 h-auto py-3",
						!selectedCategory &&
							"bg-primary text-primary-foreground",
					)}
					onClick={() => onSelectCategory(null)}
				>
					<Boxes className="h-5 w-5 flex-shrink-0" />
					<span className="text-left">{t("allCategories")}</span>
				</Button>

				{/* Individual Category Buttons */}
				{rootCategories.map((category: Category) => {
					const Icon = getCategoryIcon(category);
					const isSelected =
						selectedCategory?.documentId === category.documentId;

					return (
						<Button
							key={category.documentId}
							variant={isSelected ? "default" : "outline"}
							className={cn(
								"w-full justify-start gap-3 h-auto py-3",
								isSelected &&
									"bg-primary text-primary-foreground",
							)}
							onClick={() => onSelectCategory(category)}
						>
							{/* Use category icon if available, otherwise use mapped icon */}
							{category.icon?.url ? (
								<div className="relative h-5 w-5 flex-shrink-0">
									<Image
										src={category.icon.url}
										alt={category.name}
										fill
										className="object-contain"
									/>
								</div>
							) : (
								<Icon className="h-5 w-5 flex-shrink-0" />
							)}
							<span className="text-left">{category.name}</span>
						</Button>
					);
				})}
			</div>
		</div>
	);
}
