"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useCategoryBySlug } from "../../../../modules/marketplace/api";
import { CategorySelectionModal } from "../../../../modules/marketplace/listings/components/CategorySelectionModal";
import { ListingsGrid } from "../../../../modules/marketplace/listings/components/ListingsGrid";
import { ListingsSidebar } from "../../../../modules/marketplace/listings/components/ListingsSidebar";
import type { SortOption } from "../../../../modules/marketplace/listings/components/filters/SortFilter";
import { useFilterManager } from "../../../../modules/marketplace/listings/hooks/useFilterManager";

export default function ListingsPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const searchQuery = searchParams.get("search");
	const categorySlug = searchParams.get("category");
	const subcategorySlug = searchParams.get("subcategory");

	// State for the category modal
	const [showCategoryModal, setShowCategoryModal] = useState(false);

	// Use the filter manager hook to manage all filters
	const {
		filterManager,
		strapiQuery,
		updateAttributeFilter,
		updateSubcategory,
		updateSort,
		clearAllFilters,
		filterVersion,
	} = useFilterManager({
		categorySlug: categorySlug || null,
		subcategorySlug: subcategorySlug || null,
		sortOption: "newest",
	});

	// Check if a category is selected
	const { data: categoryData, isLoading: isCategoryLoading } =
		useCategoryBySlug(categorySlug || undefined, Boolean(categorySlug));

	// If no category is selected, show the modal
	useEffect(() => {
		if (!categorySlug && !isCategoryLoading) {
			setShowCategoryModal(true);
		}
	}, [categorySlug, isCategoryLoading]);

	// Apply search query from URL parameters if available
	useEffect(() => {
		if (searchQuery) {
			console.log("Search query:", searchQuery);
			// We could use the search query to filter categories or other fields
		}
	}, [searchQuery]);

	// Handle sort changes from the grid
	const handleSortChange = (sort: SortOption) => {
		updateSort(sort);
	};

	// If no category is set and we're still loading, show loading state
	if (!categorySlug && isCategoryLoading) {
		return (
			<div className="container py-16 flex justify-center">
				<div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
			</div>
		);
	}

	// If we have a category slug but it's invalid, show error
	if (categorySlug && !isCategoryLoading && !categoryData) {
		return (
			<div className="container py-16 text-center">
				<h2 className="text-2xl font-bold text-red-500">
					Category not found
				</h2>
				<p className="mt-2 text-muted-foreground">
					The category you're looking for doesn't exist
				</p>
				<button
					type="button"
					className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
					onClick={() => router.push("/categories")}
				>
					Browse All Categories
				</button>
			</div>
		);
	}

	return (
		<>
			{/* Category Selection Modal */}
			<CategorySelectionModal
				isOpen={showCategoryModal}
				onOpenChange={setShowCategoryModal}
				searchQuery={searchQuery}
			/>

			{/* Main Listings Content */}
			<div className="py-8">
				<div className="container">
					<h1 className="text-3xl font-bold mb-8">
						{categoryData?.name
							? `${categoryData.name} Listings`
							: searchQuery
								? `Search Results: ${searchQuery}`
								: "Browse Listings"}
					</h1>

					<div className="flex flex-col md:flex-row gap-8">
						<div className="w-full md:w-auto">
							<ListingsSidebar
								selectedCategory={categoryData}
								filterManager={filterManager}
								onUpdateAttributeFilter={updateAttributeFilter}
								onUpdateSubcategory={updateSubcategory}
								onClearFilters={clearAllFilters}
							/>
						</div>
						<ListingsGrid
							key={`listings-${filterVersion}`}
							strapiQuery={strapiQuery}
							onSortChange={handleSortChange}
						/>
					</div>
				</div>
			</div>
		</>
	);
}
