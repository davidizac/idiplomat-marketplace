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

	// Fetch subcategories when primary is selected
	const { data: primaryCategory, isLoading: isPrimaryLoading } =
		useCategoryBySlug(selectionState.selection.primary?.slug || null, {
			enabled: Boolean(selectionState.selection.primary?.slug),
		});

	// Handle primary category selection
	const handlePrimarySelect = (slug: string) => {
		if (allowSelectAll && slug === "all") {
			actions.clearSelection();
			onSelectionChange?.(null, null);
			return;
		}

		const category = rootCategories?.find((cat) => cat.slug === slug);
		if (category) {
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

		const subcategory = primaryCategory?.children?.find(
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

	const hasSubcategories =
		primaryCategory?.children && primaryCategory.children.length > 0;

	return (
		<div className={`space-y-4 ${className}`}>
			{label && <h3 className="font-semibold">{label}</h3>}

			<div className="space-y-3">
				{/* Primary Category Selection */}
				<div className="space-y-1">
					<Label className="text-sm">Category</Label>
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
				{selectionState.selection.primary && hasSubcategories && (
					<div className="space-y-1">
						<Label className="text-sm">
							{selectionState.selection.primary.name}{" "}
							Subcategories
						</Label>
						{isPrimaryLoading ? (
							<Skeleton className="h-10 w-full" />
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
									{primaryCategory?.children?.map(
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
