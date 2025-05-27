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
	const cityQuery = searchParams.get("city");

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
		updateCategory,
		updateSubcategory,
		updateSort,
		updateSearch,
		updateAddress,
		clearAllFilters,
		filterVersion,
	} = useFilterManager({
		categorySlug: categorySlug || null,
		subcategorySlug: subcategorySlug || null,
		search: searchQuery || null,
		address: cityQuery || null,
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

		// Update the filter manager
		updateCategory(category?.slug || null);

		// Update URL to reflect the category change while preserving other params
		const params = new URLSearchParams(searchParams.toString());

		if (category) {
			params.set("category", category.slug);
			params.delete("subcategory"); // Clear subcategory when category changes
		} else {
			// Clear category from URL
			params.delete("category");
			params.delete("subcategory");
		}

		router.push(`/listings?${params.toString()}`);
	};

	// Handle subcategory selection from the sidebar
	const handleSubcategorySelect = (subcategory: Category | null) => {
		setSelectedSubcategory(subcategory);

		// Update URL and filter manager while preserving other params
		const params = new URLSearchParams(searchParams.toString());

		if (subcategory) {
			params.set("subcategory", subcategory.slug);
			updateSubcategory(subcategory.slug);
		} else {
			// Clear subcategory from URL
			params.delete("subcategory");
			updateSubcategory(null);
		}

		router.push(`/listings?${params.toString()}`);
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

	// Handle city updates from the sidebar
	const handleCityUpdate = (city: string | null) => {
		updateAddress(city);

		// Update URL to reflect the city change
		const params = new URLSearchParams(searchParams.toString());
		if (city) {
			params.set("city", city);
		} else {
			params.delete("city");
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
							? `${selectedSubcategory.name} Listings${cityQuery ? ` in ${cityQuery}` : ""}`
							: selectedCategory
								? `${selectedCategory.name} Listings${cityQuery ? ` in ${cityQuery}` : ""}`
								: searchQuery
									? `Search Results: ${searchQuery}${cityQuery ? ` in ${cityQuery}` : ""}`
									: cityQuery
										? `Listings in ${cityQuery}`
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
								onUpdateAddress={handleCityUpdate}
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
