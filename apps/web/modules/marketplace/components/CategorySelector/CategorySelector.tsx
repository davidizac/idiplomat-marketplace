/**
 * Category Selector Component
 * Clean component for selecting categories using the new architecture
 */

"use client";

import { Label } from "@ui/components/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@ui/components/select";
import { Skeleton } from "@ui/components/skeleton";
import { useEffect, useMemo } from "react";
import {
	useCategoryBySlug,
	useRootCategories,
} from "../../data/category-hooks";
import type { CategoryNode } from "../../data/category-service";
import {
	useCategorySelectionActions,
	useCategorySelectionState,
} from "../../state/category-context";

interface CategorySelectorProps {
	/**
	 * Label for the component
	 */
	label?: string;

	/**
	 * Whether to show "All Categories" option
	 */
	allowSelectAll?: boolean;

	/**
	 * Callback when selection changes
	 */
	onSelectionChange?: (
		primary: CategoryNode | null,
		subcategory: CategoryNode | null,
	) => void;

	/**
	 * CSS classes
	 */
	className?: string;
}

export function CategorySelector({
	label = "Categories",
	allowSelectAll = false,
	onSelectionChange,
	className = "",
}: CategorySelectorProps) {
	const selectionState = useCategorySelectionState();
	const actions = useCategorySelectionActions();

	// Fetch root categories
	const {
		data: rootCategories,
		isLoading: isRootLoading,
		error: rootError,
	} = useRootCategories();

	// Determine if we need to fetch subcategories
	// Only fetch if primary is selected AND it doesn't already have children
	const needsSubcategoryFetch = useMemo(() => {
		if (!selectionState.selection.primary) {
			return false;
		}
		const hasChildren =
			selectionState.selection.primary.children?.length > 0;
		return !hasChildren;
	}, [selectionState.selection.primary]);

	// Fetch subcategories when primary is selected and doesn't have children
	const { data: fetchedPrimaryCategory, isLoading: isPrimaryLoading } =
		useCategoryBySlug(selectionState.selection.primary?.slug || null, {
			enabled: needsSubcategoryFetch,
		});

	// Get the current subcategories from either the selected primary or the fetched data
	const availableSubcategories = useMemo(() => {
		if (!selectionState.selection.primary) {
			return [];
		}

		// First try to use children from the selected primary category
		if (selectionState.selection.primary.children?.length > 0) {
			return selectionState.selection.primary.children;
		}

		// Otherwise use the fetched category's children
		return fetchedPrimaryCategory?.children || [];
	}, [selectionState.selection.primary, fetchedPrimaryCategory]);

	// Clear subcategory when primary category changes
	useEffect(() => {
		// When primary changes, ensure subcategory is cleared if it's not valid
		if (
			selectionState.selection.subcategory &&
			selectionState.selection.primary
		) {
			const isValidSubcategory = availableSubcategories.some(
				(sub) =>
					sub.slug === selectionState.selection.subcategory?.slug,
			);
			if (!isValidSubcategory) {
				actions.setSubcategory(null);
			}
		}
	}, [
		selectionState.selection.primary,
		availableSubcategories,
		selectionState.selection.subcategory,
		actions,
	]);

	// Handle primary category selection
	const handlePrimarySelect = (slug: string) => {
		if (allowSelectAll && slug === "all") {
			actions.clearSelection();
			onSelectionChange?.(null, null);
			return;
		}

		const category = rootCategories?.find((cat) => cat.slug === slug);
		if (category) {
			// Setting primary will automatically clear subcategory via reducer
			actions.setPrimary(category);
			onSelectionChange?.(category, null);
		}
	};

	// Handle subcategory selection
	const handleSubcategorySelect = (slug: string) => {
		if (allowSelectAll && slug === "all") {
			actions.setSubcategory(null);
			onSelectionChange?.(selectionState.selection.primary, null);
			return;
		}

		const subcategory = availableSubcategories.find(
			(cat) => cat.slug === slug,
		);
		if (subcategory) {
			actions.setSubcategory(subcategory);
			onSelectionChange?.(selectionState.selection.primary, subcategory);
		}
	};

	// Show loading skeleton
	if (isRootLoading) {
		return (
			<div className={`space-y-4 ${className}`}>
				{label && <h3 className="font-semibold">{label}</h3>}
				<div className="space-y-3">
					<Skeleton className="h-10 w-full" />
				</div>
			</div>
		);
	}

	// Show error state
	if (rootError) {
		return (
			<div className={`space-y-4 ${className}`}>
				{label && <h3 className="font-semibold">{label}</h3>}
				<div className="text-sm text-destructive">
					Failed to load categories
				</div>
			</div>
		);
	}

	const hasSubcategories = availableSubcategories.length > 0;

	return (
		<div className={`space-y-4 ${className}`}>
			{label && <h3 className="font-semibold">{label}</h3>}

			<div className="space-y-3">
				{/* Primary Category Selection */}
				<div className="space-y-1">
					<Label className="text-sm">Main Category</Label>
					<Select
						value={selectionState.selection.primary?.slug || ""}
						onValueChange={handlePrimarySelect}
					>
						<SelectTrigger>
							<SelectValue placeholder="Select a category" />
						</SelectTrigger>
						<SelectContent>
							{allowSelectAll && (
								<SelectItem value="all">
									All Categories
								</SelectItem>
							)}
							{rootCategories?.map((category) => (
								<SelectItem
									key={category.slug}
									value={category.slug}
								>
									{category.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{/* Subcategory Selection */}
				{selectionState.selection.primary && (
					<div className="space-y-1">
						<Label className="text-sm">Subcategory</Label>
						{isPrimaryLoading && needsSubcategoryFetch ? (
							<Skeleton className="h-10 w-full" />
						) : !hasSubcategories ? (
							<div className="text-sm text-muted-foreground py-2">
								No subcategories available
							</div>
						) : (
							<Select
								value={
									selectionState.selection.subcategory
										?.slug || ""
								}
								onValueChange={handleSubcategorySelect}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select a subcategory" />
								</SelectTrigger>
								<SelectContent>
									{allowSelectAll && (
										<SelectItem value="all">
											All Subcategories
										</SelectItem>
									)}
									{availableSubcategories.map(
										(subcategory) => (
											<SelectItem
												key={subcategory.slug}
												value={subcategory.slug}
											>
												{subcategory.name}
											</SelectItem>
										),
									)}
								</SelectContent>
							</Select>
						)}
					</div>
				)}
			</div>

			{/* Selection Path Display */}
			{selectionState.selection.path.length > 0 && (
				<div className="text-sm text-muted-foreground">
					<span className="font-medium">Selected: </span>
					{selectionState.selection.path.map((category, index) => (
						<span key={category.slug}>
							{index > 0 && " > "}
							{category.name}
						</span>
					))}
				</div>
			)}
		</div>
	);
}
