"use client";

import { useCategories } from "@marketplace/api";
import type { Category } from "@repo/cms";
import { Button } from "@ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@ui/components/dialog";
import { Separator } from "@ui/components/separator";
import { cn } from "@ui/lib";
import {
	Boxes,
	Car,
	Check,
	Home,
	Laptop,
	type LucideIcon,
	ShoppingBag,
	Sofa,
} from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";

interface MobileCategoryModalProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	selectedCategory: Category | null;
	selectedSubcategory: Category | null;
	onSelectCategory: (category: Category | null) => void;
	onSelectSubcategory: (subcategory: Category | null) => void;
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

export function MobileCategoryModal({
	isOpen,
	onOpenChange,
	selectedCategory,
	selectedSubcategory,
	onSelectCategory,
	onSelectSubcategory,
}: MobileCategoryModalProps) {
	const t = useTranslations("marketplace.filters");
	const { data, isLoading } = useCategories({
		pageSize: 100,
	});

	// Filter root categories (those without a parent)
	const rootCategories =
		data?.data?.filter((category: Category) => !category.parent) || [];

	const handleCategorySelect = (category: Category | null) => {
		onSelectCategory(category);
		// Clear subcategory when changing category
		onSelectSubcategory(null);
		// Close modal immediately
		onOpenChange(false);
	};

	const handleSubcategorySelect = (
		category: Category,
		subcategory: Category,
	) => {
		// Select both category and subcategory
		onSelectCategory(category);
		onSelectSubcategory(subcategory);
		// Close modal immediately
		onOpenChange(false);
	};

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md h-[85vh] p-0 flex flex-col">
				<DialogHeader className="px-6 py-4 border-b">
					<DialogTitle>{t("selectCategory")}</DialogTitle>
				</DialogHeader>

				<div className="flex-1 overflow-y-auto px-6">
					<div className="py-4 space-y-2">
						{/* All Categories Option */}
						<Button
							variant="ghost"
							className={cn(
								"w-full justify-start gap-3 h-auto py-3",
								!selectedCategory &&
									"bg-accent text-accent-foreground",
							)}
							onClick={() => handleCategorySelect(null)}
						>
							<Boxes className="h-5 w-5 flex-shrink-0" />
							<span className="flex-1 text-left font-medium">
								{t("allCategories")}
							</span>
							{!selectedCategory && (
								<Check className="h-5 w-5 text-primary" />
							)}
						</Button>

						<Separator className="my-2" />

						{/* Categories with nested subcategories */}
						{isLoading ? (
							<div className="space-y-2 animate-pulse">
								{Array.from({ length: 5 }).map((_, i) => (
									<div
										key={i}
										className="h-14 bg-muted rounded-md"
									/>
								))}
							</div>
						) : (
							rootCategories.map((category: Category) => {
								const Icon = getCategoryIcon(category);
								const isCategorySelected =
									selectedCategory?.documentId ===
									category.documentId;
								const subcategories = category.categories || [];

								return (
									<div
										key={category.documentId}
										className="space-y-1"
									>
										{/* Main Category */}
										<Button
											variant="ghost"
											className={cn(
												"w-full justify-start gap-3 h-auto py-3",
												isCategorySelected &&
													!selectedSubcategory &&
													"bg-accent text-accent-foreground",
											)}
											onClick={() =>
												handleCategorySelect(category)
											}
										>
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
											<span className="flex-1 text-left font-medium">
												{category.name}
											</span>
											{isCategorySelected &&
												!selectedSubcategory && (
													<Check className="h-5 w-5 text-primary" />
												)}
										</Button>

										{/* Subcategories under this category */}
										{subcategories.length > 0 && (
											<div className="ml-8 space-y-1">
												{subcategories.map(
													(subcategory) => {
														const isSubcategorySelected =
															selectedSubcategory?.documentId ===
															subcategory.documentId;

														return (
															<Button
																key={
																	subcategory.documentId
																}
																variant="ghost"
																className={cn(
																	"w-full justify-start gap-2 h-auto py-2 text-sm",
																	isSubcategorySelected &&
																		"bg-accent text-accent-foreground",
																)}
																onClick={() =>
																	handleSubcategorySelect(
																		category,
																		subcategory,
																	)
																}
															>
																<span className="flex-1 text-left">
																	{
																		subcategory.name
																	}
																</span>
																{isSubcategorySelected && (
																	<Check className="h-4 w-4 text-primary" />
																)}
															</Button>
														);
													},
												)}
											</div>
										)}
									</div>
								);
							})
						)}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
