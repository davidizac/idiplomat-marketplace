"use client";

import { categoryService } from "@repo/cms";
import type { Category } from "@repo/cms";
import { useQuery } from "@tanstack/react-query";
import { Label } from "@ui/components/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@ui/components/select";
import { Skeleton } from "@ui/components/skeleton";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

/**
 * Interface for a category level in the hierarchy
 */
export interface CategoryLevel {
	level: number;
	isLoading: boolean;
	categories: Category[];
	selectedSlug: string;
	parentSlug?: string;
}

/**
 * Interface for category selection data
 */
export interface CategorySelectionData {
	levels: CategoryLevel[];
	selectedCategories: Array<{
		slug: string;
		name: string;
		documentId: string;
		level: number;
	}>;
}

export interface CategorySelectorProps {
	/**
	 * Initial category levels (optional)
	 */
	initialLevels?: CategoryLevel[];

	/**
	 * Initial selected categories (optional)
	 */
	initialSelection?: Array<{
		slug: string;
		name: string;
		documentId: string;
		level: number;
	}>;

	/**
	 * Whether to show a "Select All" option in each dropdown
	 */
	allowSelectAll?: boolean;

	/**
	 * Whether to show the selected category path display
	 */
	showSelectionPath?: boolean;

	/**
	 * Label for the component
	 */
	label?: string;

	/**
	 * Labels for levels. If not provided, defaults will be used.
	 */
	levelLabels?: {
		root?: string;
		subcategory?: string;
	};

	/**
	 * Placeholder text for levels. If not provided, defaults will be used.
	 */
	placeholders?: {
		root?: string;
		subcategory?: string;
	};

	/**
	 * CSS classes to apply to the component
	 */
	className?: string;

	/**
	 * Callback for when a selection changes
	 */
	onSelectionChange?: (data: CategorySelectionData) => void;

	/**
	 * Trigger attributes category
	 */
	onCategorySelect?: (level: number, category: Category | null) => void;
}

export function CategorySelector({
	initialLevels,
	initialSelection = [],
	allowSelectAll = false,
	showSelectionPath = true,
	label = "Categories",
	levelLabels = {
		root: "Main Category",
		subcategory: "Subcategories",
	},
	placeholders = {
		root: "Select a category",
		subcategory: "Select a subcategory",
	},
	className = "",
	onSelectionChange,
	onCategorySelect,
}: CategorySelectorProps) {
	// State for category levels and selection
	console.log(initialSelection);
	const params = useSearchParams();
	const category = params.get("category");
	const subcategory = params.get("subcategory");
	const [levels, setLevels] = useState<CategoryLevel[]>(initialLevels || []);
	const [selectedPath, setSelectedPath] = useState<Category[]>([]);
	const [selectedCategories, setSelectedCategories] =
		useState<
			Array<{
				slug: string;
				name: string;
				documentId: string;
				level: number;
			}>
		>(initialSelection);

	// Fetch root categories if no initial levels are provided
	const { data: rootCategories, isLoading: isRootCategoriesLoading } =
		useQuery({
			queryKey: ["root-categories"],
			queryFn: async () => {
				console.log("Fetching root categories");
				const result = await categoryService.getRootCategories();
				return result.data;
			},
			enabled: !initialLevels || initialLevels.length === 0,
		});

	// Initialize with root categories if not provided
	useEffect(() => {
		if (!initialLevels && rootCategories && !isRootCategoriesLoading) {
			const initialLevels = [
				{
					level: 0,
					isLoading: false,
					categories: rootCategories,
					selectedSlug: category ?? (allowSelectAll ? "all" : ""),
				},
			];
			setLevels(initialLevels);
		}
	}, [
		rootCategories,
		isRootCategoriesLoading,
		initialLevels,
		allowSelectAll,
		category,
	]);

	// Sync URL parameters with component state
	useEffect(() => {
		if (!rootCategories) return;

		// Update the first level selection to match URL only if levels exist
		setLevels((prev) => {
			if (prev.length === 0) return prev;

			const newLevels = [...prev];
			if (newLevels[0]) {
				const newSelectedSlug =
					category ?? (allowSelectAll ? "all" : "");
				// Only update if it's actually different to avoid infinite loops
				if (newLevels[0].selectedSlug !== newSelectedSlug) {
					newLevels[0] = {
						...newLevels[0],
						selectedSlug: newSelectedSlug,
					};
					return newLevels;
				}
			}
			return prev;
		});
	}, [category, allowSelectAll, rootCategories]);

	// Notify parent when URL category changes (but only when we have the data)
	useEffect(() => {
		if (!rootCategories || !onCategorySelect) return;

		if (category) {
			const categoryData = rootCategories.find(
				(c) => c.slug === category,
			);
			if (categoryData) {
				onCategorySelect(0, categoryData);
			}
		} else {
			onCategorySelect(0, null);
		}
	}, [category, rootCategories]); // Removed onCategorySelect from deps to avoid loops

	// Handle category selection
	const handleCategorySelect = useCallback(
		async (level: number, slug: string) => {
			// Handle "all" value for "Select All" option
			if (allowSelectAll && slug === "all") {
				// If clearing a selection, remove all deeper levels
				setLevels((prev) => {
					const newLevels = prev.slice(0, level + 1);

					// Notify about selection change
					if (onSelectionChange) {
						setSelectedCategories((prevSelected) => {
							const filteredCategories = prevSelected.filter(
								(cat) => cat.level < level,
							);
							onSelectionChange({
								levels: newLevels,
								selectedCategories: filteredCategories,
							});
							return filteredCategories;
						});
					} else {
						setSelectedCategories((prev) =>
							prev.filter((cat) => cat.level < level),
						);
					}

					return newLevels;
				});

				// Update selected path - remove items at and beyond this level
				setSelectedPath((prev) => prev.filter((_, i) => i < level));

				// Notify parent component
				if (onCategorySelect) {
					onCategorySelect(level, null);
				}

				return;
			}

			if (!slug) {
				return; // Skip empty selections
			}

			try {
				// Update the current level's selection and set loading
				setLevels((prev) => {
					const newLevels = [...prev];
					newLevels[level] = {
						...newLevels[level],
						selectedSlug: slug,
						isLoading: true,
					};

					// Remove any deeper levels
					return newLevels.slice(0, level + 1);
				});

				// Fetch the category details
				const categoryDetails =
					await categoryService.getCategoryBySlug(slug);

				// Update selected path
				setSelectedPath((prev) => {
					const newPath = prev.filter((_, i) => i < level);
					newPath.push(categoryDetails);
					return newPath;
				});

				// Update selected categories and levels together
				setSelectedCategories((prevSelected) => {
					// Remove any categories at or beyond this level
					const newCategories = prevSelected.filter(
						(cat) => cat.level < level,
					);

					// Add the newly selected category
					newCategories.push({
						level,
						slug,
						name: categoryDetails.name,
						documentId: categoryDetails.documentId,
					});

					// Check for subcategories
					const hasSubcategories =
						categoryDetails.categories?.length > 0;

					// Update levels state
					setLevels((prevLevels) => {
						const updatedLevels = [...prevLevels];
						updatedLevels[level] = {
							...updatedLevels[level],
							isLoading: false,
						};

						// Only create a second (subcategory) level when the user is selecting from the root level (level === 0).
						// This prevents rendering deeper nested dropdowns like "Parent subcategories" that are not needed.
						if (hasSubcategories && level === 0) {
							updatedLevels.push({
								level: level + 1,
								isLoading: false,
								categories: categoryDetails.categories,
								selectedSlug: allowSelectAll ? "all" : "",
								parentSlug: slug,
							});
						}

						// Notify about selection change with updated data
						if (onSelectionChange) {
							onSelectionChange({
								levels: updatedLevels,
								selectedCategories: newCategories,
							});
						}

						return updatedLevels;
					});

					return newCategories;
				});

				// Notify parent component
				if (onCategorySelect) {
					onCategorySelect(level, categoryDetails);
				}
			} catch (error) {
				console.error("Error selecting category:", error);

				// Reset loading state on error
				setLevels((prev) => {
					const newLevels = [...prev];
					if (newLevels[level]) {
						newLevels[level] = {
							...newLevels[level],
							isLoading: false,
						};
					}
					return newLevels;
				});
			}
		},
		[allowSelectAll, onCategorySelect, onSelectionChange],
	);

	// If loading and no levels, show skeleton
	if ((isRootCategoriesLoading || levels.length === 0) && !initialLevels) {
		return (
			<div className={`space-y-4 ${className}`}>
				{label && <h3 className="font-semibold">{label}</h3>}
				<div className="space-y-2">
					<Skeleton className="h-10 w-full" />
				</div>
			</div>
		);
	}

	return (
		<div className={`space-y-4 ${className}`}>
			{label && <h3 className="font-semibold">{label}</h3>}

			{/* Display category dropdowns for each level */}
			<div className="space-y-3">
				{levels.map((level, index) => (
					<div key={`category-level-${index}`} className="space-y-1">
						<Label
							htmlFor={`category-level-${index}`}
							className="text-sm"
						>
							{index === 0
								? levelLabels.root
								: `${
										levels[index - 1]?.categories.find(
											(cat) =>
												cat.slug ===
												levels[index - 1]?.selectedSlug,
										)?.name || "Parent"
									} ${levelLabels.subcategory}`}
						</Label>

						{level.isLoading ? (
							<Skeleton className="h-10 w-full" />
						) : (
							<Select
								value={level.selectedSlug}
								onValueChange={(value) =>
									handleCategorySelect(index, value)
								}
							>
								<SelectTrigger
									id={`category-level-${index}`}
									className="w-full"
								>
									<SelectValue
										placeholder={
											index === 0
												? placeholders.root
												: placeholders.subcategory
										}
									/>
								</SelectTrigger>
								<SelectContent>
									{allowSelectAll && (
										<SelectItem value="all">
											{index === 0
												? "All Categories"
												: "All Subcategories"}
										</SelectItem>
									)}
									{level.categories.length === 0 ? (
										<div className="py-2 px-2 text-sm text-muted-foreground">
											No categories available
										</div>
									) : (
										level.categories.map((category) => (
											<SelectItem
												key={category.slug}
												value={category.slug}
											>
												{category.name}
											</SelectItem>
										))
									)}
								</SelectContent>
							</Select>
						)}
					</div>
				))}
			</div>
		</div>
	);
}
