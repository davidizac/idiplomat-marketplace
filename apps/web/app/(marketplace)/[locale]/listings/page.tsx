"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ListingsGrid } from "../../../../modules/marketplace/listings/components/ListingsGrid";
import {
	type FilterState,
	ListingsSidebar,
} from "../../../../modules/marketplace/listings/components/ListingsSidebar";

export default function ListingsPage() {
	const searchParams = useSearchParams();
	const searchQuery = searchParams.get("search");

	// Initial filters
	const initialFilters: FilterState = {
		categories: [],
		priceRange: [0, 5000],
		location: "all",
		conditions: [],
		sort: "newest",
	};

	const [activeFilters, setActiveFilters] =
		useState<FilterState>(initialFilters);

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
	const handleFilterChange = useCallback((filters: FilterState) => {
		setActiveFilters(filters);
	}, []);

	return (
		<div className="py-8">
			<div className="container">
				<h1 className="text-3xl font-bold mb-8">
					{searchQuery
						? `Search Results: ${searchQuery}`
						: "Browse Listings"}
				</h1>

				<div className="flex flex-col md:flex-row gap-8">
					<div className="w-full md:w-auto">
						<ListingsSidebar
							onChange={handleFilterChange}
							initialFilters={initialFilters}
						/>
					</div>
					<ListingsGrid filters={activeFilters} />
				</div>
			</div>
		</div>
	);
}
