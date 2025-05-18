"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useCategoryBySlug } from "../../../../modules/marketplace/api";
import { CategorySelectionModal } from "../../../../modules/marketplace/listings/components/CategorySelectionModal";
import { ListingsGrid } from "../../../../modules/marketplace/listings/components/ListingsGrid";
import {
	type FilterState,
	ListingsSidebar,
} from "../../../../modules/marketplace/listings/components/ListingsSidebar";

export default function ListingsPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const searchQuery = searchParams.get("search");
	const categorySlug = searchParams.get("category");

	// State for the category modal
	const [showCategoryModal, setShowCategoryModal] = useState(false);

	// Initial filters
	const initialFilters: FilterState = {
		categories: categorySlug ? [categorySlug] : [],
		priceRange: [0, 5000],
		location: "all",
		conditions: [],
		sort: "newest",
	};

	const [activeFilters, setActiveFilters] =
		useState<FilterState>(initialFilters);

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
			// We could use the search query to filter categories or other fields
			// For now, just logging to show it's capturing the query
			console.log("Search query:", searchQuery);

			// In a real implementation, we might call an API with the search term
			// or update other filter parameters based on the search query
		}
	}, [searchQuery]);

	// Memoize the filter change handler to prevent unnecessary re-renders
	const handleFilterChange = useCallback(
		(filters: FilterState) => {
			setActiveFilters(filters);

			// Update URL with the selected category
			if (filters.categories && filters.categories.length > 0) {
				const urlParams = new URLSearchParams(searchParams.toString());
				urlParams.set("category", filters.categories[0]);

				// Replace the current URL with the new one
				router.replace(`/listings?${urlParams.toString()}`);
			}
		},
		[router, searchParams],
	);

	// If no category is set and we're still loading, show loading state
	if (!categorySlug && isCategoryLoading) {
		return (
			<div className="container py-16 flex justify-center">
				<div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
			</div>
		);
	}

	// If we have a category slug but it's invalid, show error
	if (categorySlug && !isCategoryLoading && !categoryData?.data) {
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
						{categoryData?.data?.name
							? `${categoryData.data.name} Listings`
							: searchQuery
								? `Search Results: ${searchQuery}`
								: "Browse Listings"}
					</h1>

					<div className="flex flex-col md:flex-row gap-8">
						<div className="w-full md:w-auto">
							<ListingsSidebar
								onChange={handleFilterChange}
								initialFilters={initialFilters}
								selectedCategory={categoryData?.data}
							/>
						</div>
						<ListingsGrid filters={activeFilters} />
					</div>
				</div>
			</div>
		</>
	);
}
