"use client";

import { useLocaleRouter } from "@i18n/routing";
import { FaqSection } from "@marketing/home/components/FaqSection";
import { Features } from "@marketing/home/components/Features";
import { Newsletter } from "@marketing/home/components/Newsletter";
import { useCategoryBySlug } from "@marketplace/api";
import type { Category } from "@repo/cms";
import { Button } from "@ui/components/button";
import { SlidersHorizontal } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ListingsGrid } from "../../../../modules/marketplace/listings/components/ListingsGrid";
import { ListingsSidebar } from "../../../../modules/marketplace/listings/components/ListingsSidebar";
import { MobileCategoryModal } from "../../../../modules/marketplace/listings/components/MobileCategoryModal";
import { MobileFilterButton } from "../../../../modules/marketplace/listings/components/MobileFilterButton";
import { MobileFiltersModal } from "../../../../modules/marketplace/listings/components/MobileFiltersModal";
import type { SortOption } from "../../../../modules/marketplace/listings/components/filters/SortFilter";
import { useFilterManager } from "../../../../modules/marketplace/listings/hooks/useFilterManager";

export default function ListingsPage() {
	console.log("[ListingsPage] Component rendering:", {
		timestamp: new Date().toISOString(),
	});

	const router = useLocaleRouter();
	const searchParams = useSearchParams();
	const searchQuery = searchParams.get("search");
	const categorySlug = searchParams.get("category");
	const subcategorySlug = searchParams.get("subcategory");
	const cityQuery = searchParams.get("city");
	const minPriceQuery = searchParams.get("minPrice");
	const maxPriceQuery = searchParams.get("maxPrice");

	console.log("[ListingsPage] URL params:", {
		searchQuery,
		categorySlug,
		subcategorySlug,
		cityQuery,
		minPriceQuery,
		maxPriceQuery,
	});

	// Fetch category data if a category slug is present
	const { data: categoryData } = useCategoryBySlug(categorySlug || undefined);
	const [selectedCategory, setSelectedCategory] = useState<Category | null>(
		null,
	);
	const [selectedSubcategory, setSelectedSubcategory] =
		useState<Category | null>(null);

	// Mobile modal states
	const [showMobileModal, setShowMobileModal] = useState(false);
	const [showFiltersModal, setShowFiltersModal] = useState(false);

	// Update selected category when data is fetched
	useEffect(() => {
		if (categoryData) {
			setSelectedCategory(categoryData);
		} else if (!categorySlug) {
			setSelectedCategory(null);
		}
	}, [categoryData, categorySlug]);

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
		updatePriceRange,
		clearAllFilters,
		filterVersion,
	} = useFilterManager({
		categorySlug: categorySlug || null,
		subcategorySlug: subcategorySlug || null,
		search: searchQuery || null,
		address: cityQuery || null,
		priceRange:
			minPriceQuery || maxPriceQuery
				? {
						min: minPriceQuery ? Number.parseInt(minPriceQuery) : 0,
						max: maxPriceQuery
							? Number.parseInt(maxPriceQuery)
							: 10000,
					}
				: null,
		sortOption: "newest",
	});

	// Update selected subcategory from URL or category data
	useEffect(() => {
		if (subcategorySlug && selectedCategory?.categories) {
			const subcategory = selectedCategory.categories.find(
				(cat) => cat.slug === subcategorySlug,
			);
			setSelectedSubcategory(subcategory || null);
		} else {
			setSelectedSubcategory(null);
		}
	}, [subcategorySlug, selectedCategory]);

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

	// Handle price range updates from the sidebar
	const handlePriceRangeUpdate = (range: [number, number]) => {
		updatePriceRange(range[0], range[1]);

		// Update URL to reflect the price range change
		const params = new URLSearchParams(searchParams.toString());
		if (range[0] > 0 || range[1] < 10000) {
			params.set("minPrice", range[0].toString());
			params.set("maxPrice", range[1].toString());
		} else {
			params.delete("minPrice");
			params.delete("maxPrice");
		}
		router.push(`/listings?${params.toString()}`);
	};

	return (
		<>
			{/* Mobile Category Modal */}
			<MobileCategoryModal
				isOpen={showMobileModal}
				onOpenChange={setShowMobileModal}
				selectedCategory={selectedCategory}
				selectedSubcategory={selectedSubcategory}
				onSelectCategory={handleCategorySelect}
				onSelectSubcategory={handleSubcategorySelect}
			/>

			{/* Mobile Filters Modal */}
			<MobileFiltersModal
				isOpen={showFiltersModal}
				onOpenChange={setShowFiltersModal}
				selectedCategory={selectedCategory}
				filterManager={filterManager}
				onUpdateAttributeFilter={updateAttributeFilter}
				onUpdateSearch={handleSearchUpdate}
				onUpdateAddress={handleCityUpdate}
				onUpdatePriceRange={handlePriceRangeUpdate}
				onClearFilters={clearAllFilters}
			/>

			<div className="py-4 md:py-8">
				<div className="container mx-auto px-4">
					<h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">
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

					<div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
						{/* Desktop Sidebar - Hidden on mobile */}
						<div className="hidden lg:block w-auto">
							<ListingsSidebar
								filterManager={filterManager}
								selectedCategory={selectedCategory}
								onUpdateAttributeFilter={updateAttributeFilter}
								onUpdateCategory={handleCategorySelect}
								onUpdateSubcategory={handleSubcategorySelect}
								onUpdateSearch={handleSearchUpdate}
								onUpdateAddress={handleCityUpdate}
								onUpdatePriceRange={handlePriceRangeUpdate}
								onClearFilters={clearAllFilters}
							/>
						</div>

						{/* Main Content */}
						<div className="flex-1 min-w-0">
							{/* Mobile Filter Buttons - Only visible on mobile */}
							<div className="lg:hidden mb-4 space-y-3">
								{/* Category Selection Button */}
								<MobileFilterButton
									selectedCategory={selectedCategory}
									selectedSubcategory={selectedSubcategory}
									onClick={() => setShowMobileModal(true)}
								/>

								{/* Additional Filters Button - Only show when category is selected */}
								{selectedCategory && (
									<Button
										onClick={() =>
											setShowFiltersModal(true)
										}
										className="w-full justify-between gap-2 h-auto py-3"
										variant="outline"
									>
										<div className="flex items-center gap-2">
											<SlidersHorizontal className="h-4 w-4 flex-shrink-0" />
											<span className="font-medium">
												More Filters
											</span>
										</div>
										<span className="text-xs text-muted-foreground whitespace-nowrap">
											Search, Location & More
										</span>
									</Button>
								)}
							</div>

							<ListingsGrid
								strapiQuery={strapiQuery}
								onSortChange={handleSortChange}
								selectedCategory={selectedCategory}
								selectedSubcategory={selectedSubcategory}
								onSelectSubcategory={handleSubcategorySelect}
							/>
						</div>
					</div>
				</div>
			</div>

			{/* Landing Page Sections */}
			<Features />
			<FaqSection />
			<Newsletter />
		</>
	);
}
