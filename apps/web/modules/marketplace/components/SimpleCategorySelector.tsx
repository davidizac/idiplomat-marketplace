/**
 * Simple Category Selector
 * Unified component for selecting categories (2 levels: primary + subcategory)
 * Works for both filtering and form creation without complex state management
 */

"use client";

import { categoryService } from "@repo/cms";
import type { Category } from "@repo/cms";
import { useQuery } from "@tanstack/react-query";
import { Combobox } from "@ui/components/combobox";
import { Label } from "@ui/components/label";
import { Skeleton } from "@ui/components/skeleton";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

export interface SimpleCategorySelection {
	primary: Category | null;
	subcategory: Category | null;
}

export interface SimpleCategorySelectorProps {
	/**
	 * Label for the component
	 */
	label?: string;

	/**
	 * Initial primary category slug
	 */
	initialPrimarySlug?: string | null;

	/**
	 * Initial subcategory slug
	 */
	initialSubcategorySlug?: string | null;

	/**
	 * Whether to show "All Categories/Subcategories" option
	 */
	allowSelectAll?: boolean;

	/**
	 * Callback when selection changes
	 */
	onChange?: (selection: SimpleCategorySelection) => void;

	/**
	 * Custom labels
	 */
	labels?: {
		primary?: string;
		subcategory?: string;
	};

	/**
	 * Custom placeholders
	 */
	placeholders?: {
		primary?: string;
		subcategory?: string;
	};

	/**
	 * CSS classes
	 */
	className?: string;
}

export function SimpleCategorySelector({
	label,
	initialPrimarySlug = null,
	initialSubcategorySlug = null,
	allowSelectAll = false,
	onChange,
	labels: labelsProp,
	placeholders: placeholdersProp,
	className = "",
}: SimpleCategorySelectorProps) {
	const t = useTranslations("marketplace.filters");
	const labels = {
		primary: labelsProp?.primary ?? t("mainCategory"),
		subcategory: labelsProp?.subcategory ?? t("subcategory"),
	};
	const placeholders = {
		primary: placeholdersProp?.primary ?? "Select a category",
		subcategory: placeholdersProp?.subcategory ?? "Select a subcategory",
	};
	const [primarySlug, setPrimarySlug] = useState<string | null>(
		initialPrimarySlug,
	);
	const [subcategorySlug, setSubcategorySlug] = useState<string | null>(
		initialSubcategorySlug,
	);

	// Fetch root categories
	const {
		data: rootCategories,
		isLoading: isRootLoading,
		error: rootError,
	} = useQuery({
		queryKey: ["root-categories"],
		queryFn: async () => {
			const result = await categoryService.getRootCategories();
			return result.data;
		},
	});

	// Fetch primary category details (to get subcategories)
	const { data: primaryCategory, isLoading: isPrimaryLoading } = useQuery({
		queryKey: ["category", primarySlug],
		queryFn: async () => {
			if (!primarySlug) {
				return null;
			}
			return categoryService.getCategoryBySlug(primarySlug);
		},
		enabled: Boolean(primarySlug),
	});

	// Get subcategories from primary category
	const subcategories = primaryCategory?.categories || [];

	// Convert categories to combobox options
	const primaryOptions = useMemo(() => {
		if (!rootCategories) {
			return [];
		}
		const options = rootCategories.map((cat) => ({
			value: cat.slug,
			label: cat.name,
		}));
		return allowSelectAll
			? [{ value: "all", label: t("allCategories") }, ...options]
			: options;
	}, [rootCategories, allowSelectAll, t]);

	const subcategoryOptions = useMemo(() => {
		const options = subcategories.map((cat) => ({
			value: cat.slug,
			label: cat.name,
		}));
		return allowSelectAll
			? [{ value: "all", label: t("allSubcategories") }, ...options]
			: options;
	}, [subcategories, allowSelectAll, t]);

	// Handle primary category change
	const handlePrimaryChange = (value: string) => {
		if (value === "all") {
			setPrimarySlug(null);
			setSubcategorySlug(null);
			onChange?.({ primary: null, subcategory: null });
			return;
		}

		setPrimarySlug(value);
		setSubcategorySlug(null); // Reset subcategory when primary changes

		const selected = rootCategories?.find((cat) => cat.slug === value);
		if (onChange) {
			onChange({
				primary: selected || null,
				subcategory: null,
			});
		}
	};

	// Handle subcategory change
	const handleSubcategoryChange = (value: string) => {
		if (value === "all") {
			setSubcategorySlug(null);
			const primary = rootCategories?.find(
				(cat) => cat.slug === primarySlug,
			);
			onChange?.({ primary: primary || null, subcategory: null });
			return;
		}

		setSubcategorySlug(value);
		const selected = subcategories.find((cat) => cat.slug === value);
		const primary = rootCategories?.find((cat) => cat.slug === primarySlug);

		onChange?.({
			primary: primary || null,
			subcategory: selected || null,
		});
	};

	// Update local state when initial values change
	useEffect(() => {
		if (initialPrimarySlug !== primarySlug) {
			setPrimarySlug(initialPrimarySlug);
		}
	}, [initialPrimarySlug]);

	useEffect(() => {
		if (initialSubcategorySlug !== subcategorySlug) {
			setSubcategorySlug(initialSubcategorySlug);
		}
	}, [initialSubcategorySlug]);

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
					{t("categoriesLoadError")}
				</div>
			</div>
		);
	}

	return (
		<div className={`space-y-4 ${className}`}>
			{label && <h3 className="font-semibold">{label}</h3>}

			<div className="space-y-3">
				{/* Primary Category Selection */}
				<div className="space-y-1">
					<Label className="text-sm">{labels.primary}</Label>
					<Combobox
						options={primaryOptions}
						value={primarySlug || ""}
						onValueChange={handlePrimaryChange}
						placeholder={placeholders.primary}
						searchPlaceholder={t("searchCategories")}
						emptyText={t("noCategoriesFound")}
						allowClear={allowSelectAll}
					/>
				</div>

				{/* Subcategory Selection */}
				{primarySlug && (
					<div className="space-y-1">
						<Label className="text-sm">{labels.subcategory}</Label>
						{isPrimaryLoading ? (
							<Skeleton className="h-10 w-full" />
						) : subcategories.length === 0 ? (
							<div className="text-sm text-muted-foreground py-2">
								{t("noSubcategoriesAvailable")}
							</div>
						) : (
							<Combobox
								options={subcategoryOptions}
								value={subcategorySlug || ""}
								onValueChange={handleSubcategoryChange}
								placeholder={placeholders.subcategory}
								searchPlaceholder={t("searchSubcategories")}
								emptyText={t("noSubcategoriesFound")}
								allowClear={allowSelectAll}
							/>
						)}
					</div>
				)}
			</div>

			{/* Selection Path Display */}
			{primarySlug && (
				<div className="text-sm text-muted-foreground">
					<span className="font-medium">{t("selected")} </span>
					{
						rootCategories?.find((cat) => cat.slug === primarySlug)
							?.name
					}
					{subcategorySlug && (
						<>
							{" > "}
							{
								subcategories.find(
									(cat) => cat.slug === subcategorySlug,
								)?.name
							}
						</>
					)}
				</div>
			)}
		</div>
	);
}
