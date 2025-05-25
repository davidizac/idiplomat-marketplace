"use client";

import { useLocaleRouter } from "@i18n/routing";
import type { Category } from "@repo/cms";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CategorySelectionModal } from "../../../../modules/marketplace/listings/components/CategorySelectionModal";
import { ListingsGrid } from "../../../../modules/marketplace/listings/components/ListingsGrid";
import { ListingsSidebar } from "../../../../modules/marketplace/listings/components/ListingsSidebar";
import type { SortOption } from "../../../../modules/marketplace/listings/components/filters/SortFilter";
import { useFilterManager } from "../../../../modules/marketplace/listings/hooks/useFilterManager";

export default function ListingsPage() {
	const router = useLocaleRouter();
	const searchParams = useSearchParams();
	const searchQuery = searchParams.get("search");
	const categorySlug = searchParams.get("category");
	const subcategorySlug = searchParams.get("subcategory");

	// State for the category modal
	const [showCategoryModal, setShowCategoryModal] = useState(false);
	const [selectedCategory, setSelectedCategory] = useState<Category | null>(
		null,
	);
	const [selectedSubcategory, setSelectedSubcategory] =
		useState<Category | null>(null);

	// Use the filter manager hook to manage all filters
	const {
		filterManager,
		strapiQuery,
		updateAttributeFilter,
		updateSubcategory,
		updateSort,
		updateSearch,
		clearAllFilters,
		filterVersion,
	} = useFilterManager({
		categorySlug: categorySlug || null,
		subcategorySlug: subcategorySlug || null,
		search: searchQuery || null,
		sortOption: "newest",
	});

	// If no category is selected, show the modal
	useEffect(() => {
		if (!categorySlug) {
			setShowCategoryModal(true);
		}
	}, [categorySlug]);

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

	// Handle category selection from the sidebar
	const handleCategorySelect = (category: Category | null) => {
		setSelectedCategory(category);

		// Update URL to reflect the category change
		if (category) {
			const params = new URLSearchParams(searchParams.toString());
			params.set("category", category.slug);
			params.delete("subcategory"); // Clear subcategory when category changes
			router.push(`/listings?${params.toString()}`);
		} else {
			// Clear category from URL
			const params = new URLSearchParams(searchParams.toString());
			params.delete("category");
			params.delete("subcategory");
			router.push(`/listings?${params.toString()}`);
		}
	};

	// Handle subcategory selection from the sidebar
	const handleSubcategorySelect = (subcategory: Category | null) => {
		setSelectedSubcategory(subcategory);

		// Update URL and filter manager
		if (subcategory) {
			const params = new URLSearchParams(searchParams.toString());
			params.set("subcategory", subcategory.slug);
			router.push(`/listings?${params.toString()}`);
			updateSubcategory(subcategory.slug);
		} else {
			// Clear subcategory from URL
			const params = new URLSearchParams(searchParams.toString());
			params.delete("subcategory");
			router.push(`/listings?${params.toString()}`);
			updateSubcategory(null);
		}
	};

	// Handle search updates from the sidebar
	const handleSearchUpdate = (searchTerm: string | null) => {
		updateSearch(searchTerm);

		// Update URL to reflect the search change
		const params = new URLSearchParams(searchParams.toString());
		if (searchTerm) {
			params.set("search", searchTerm);
		} else {
			params.delete("search");
		}
		router.push(`/listings?${params.toString()}`);
	};

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
						{selectedSubcategory
							? `${selectedSubcategory.name} Listings`
							: selectedCategory
								? `${selectedCategory.name} Listings`
								: searchQuery
									? `Search Results: ${searchQuery}`
									: "Browse Listings"}
					</h1>

					<div className="flex flex-col md:flex-row gap-8">
						<div className="w-full md:w-auto">
							<ListingsSidebar
								filterManager={filterManager}
								onUpdateAttributeFilter={updateAttributeFilter}
								onUpdateCategory={handleCategorySelect}
								onUpdateSubcategory={handleSubcategorySelect}
								onUpdateSearch={handleSearchUpdate}
								onClearFilters={clearAllFilters}
							/>
						</div>
						<ListingsGrid
							strapiQuery={strapiQuery}
							onSortChange={handleSortChange}
						/>
					</div>
				</div>
			</div>
		</>
	);
}
