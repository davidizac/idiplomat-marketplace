"use client";

import {
	type ListingData,
	getImageUrl,
	useCategoryBySlug,
	useListings,
} from "@marketplace/api";
import { Card } from "@ui/components/card";
import { Skeleton } from "@ui/components/skeleton";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { AttributeFilterValues } from "./filters/AttributeFilter";
import { SortFilter, type SortOption } from "./filters/SortFilter";

interface FilterState {
	sort: SortOption;
	attributes?: AttributeFilterValues;
	subcategories?: string[] | null;
}

interface ListingCardProps {
	id: string;
	title: string;
	category: string;
	imageUrl: string;
	createdAt: Date;
}

function ListingCard({ id, title, category, imageUrl }: ListingCardProps) {
	return (
		<Link href={`/listings/${id}`}>
			<Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
				<div className="relative h-48">
					<Image
						src={imageUrl || "/images/hero-image.png"}
						alt={title}
						fill
						className="object-cover"
						sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
					/>
				</div>
				<div className="p-4">
					<div className="flex items-start justify-between">
						<h3 className="font-semibold truncate flex-1">
							{title}
						</h3>
						<span className="font-bold text-lg ml-2">$12</span>
					</div>
					<div className="mt-2 flex items-center text-sm text-muted-foreground">
						{/* <span>{location}</span> */}
					</div>
					<div className="mt-3 flex gap-2">
						<div className="bg-secondary text-xs px-2 py-1 rounded-full">
							{category}
						</div>
					</div>
				</div>
			</Card>
		</Link>
	);
}

// Loading skeleton for listings
function ListingCardSkeleton() {
	return (
		<Card className="overflow-hidden h-full">
			<div className="relative h-48">
				<Skeleton className="h-full w-full" />
			</div>
			<div className="p-4">
				<div className="flex items-start justify-between">
					<Skeleton className="h-6 w-3/4" />
					<Skeleton className="h-6 w-1/5 ml-2" />
				</div>
				<div className="mt-2">
					<Skeleton className="h-4 w-1/3" />
				</div>
				<div className="mt-3 flex gap-2">
					<Skeleton className="h-6 w-20 rounded-full" />
					<Skeleton className="h-6 w-20 rounded-full" />
				</div>
			</div>
		</Card>
	);
}

interface ListingsGridProps {
	filters?: FilterState;
	categorySlug: string;
}

export function ListingsGrid({ filters, categorySlug }: ListingsGridProps) {
	const [sortOption, setSortOption] = useState<SortOption>("newest");
	const [currentPage, setCurrentPage] = useState<number>(1);

	// Fetch category data to get attribute information if a category is selected
	const { data: categoryData } = useCategoryBySlug(
		categorySlug,
		!!categorySlug,
	);
	const selectedCategory = categoryData?.data;

	// Create attributeFilters array for the new API parameter
	const attributeFilters: Array<{
		attribute: string;
		value: string;
		operator?: "and" | "or";
	}> = [];

	// Add attribute filters if any are set
	if (filters?.attributes && Object.keys(filters.attributes).length > 0) {
		// Create a map of attribute IDs to their names from the category data
		const attributeMap = new Map<number, string>();

		// Populate the attribute map from the selected category's attributes
		if (selectedCategory?.attributes) {
			selectedCategory.attributes.forEach((attr) => {
				attributeMap.set(attr.id, attr.name);
			});
		}

		// Track which attributes have multiple values (for OR filtering)
		const multiSelectAttributes = new Set<string>();

		// For each attribute, add to the attributeFilters array
		Object.entries(filters.attributes).forEach(([attributeId, value]) => {
			// Skip empty values
			if (
				value === null ||
				value === undefined ||
				value === "" ||
				(Array.isArray(value) && value.length === 0)
			) {
				return;
			}

			// Get attribute name from the map or use common values for demo
			const attributeIdNum = Number(attributeId);
			let attributeName = attributeMap.get(attributeIdNum);

			// If we can't find the name in our map, use a fallback
			if (!attributeName) {
				// Instead of using hardcoded names, we'll use the attribute ID directly
				// This ensures at least the filter will work even if we don't have the name
				attributeName = `attribute_${attributeId}`;

				// Log a warning for debugging
				console.warn(
					`Could not find name for attribute ID ${attributeId}`,
				);
			}

			// Handle different types of attribute values
			if (typeof value === "string") {
				attributeFilters.push({
					attribute: attributeName,
					value: value,
				});
			} else if (typeof value === "number") {
				attributeFilters.push({
					attribute: attributeName,
					value: value.toString(),
				});
			} else if (typeof value === "boolean") {
				attributeFilters.push({
					attribute: attributeName,
					value: value.toString(),
				});
			} else if (value instanceof Date) {
				attributeFilters.push({
					attribute: attributeName,
					value: value.toISOString(),
				});
			} else if (Array.isArray(value) && value.length > 0) {
				// For multi-select values, add each value with an OR operator
				multiSelectAttributes.add(attributeName);

				value.forEach((option) => {
					attributeFilters.push({
						attribute: attributeName,
						value: option,
						operator: "or", // Use OR for multi-select values
					});
				});
			}
		});
	}

	// Convert sort option to Strapi format
	let strapiSort = "createdAt:desc"; // default newest first

	if (filters?.sort || sortOption) {
		const sortBy = filters?.sort || sortOption;
		switch (sortBy) {
			case "price-low-high":
				strapiSort = "price:asc";
				break;
			case "price-high-low":
				strapiSort = "price:desc";
				break;
			default:
				strapiSort = "createdAt:desc";
				break;
		}
	}

	// Log the query parameters for debugging
	useEffect(() => {
		if (attributeFilters.length > 0) {
			console.log("Attribute filters:", attributeFilters);
		}
	}, [attributeFilters]);

	// Fetch listings from Strapi with the new attributeFilters parameter
	const { data, isLoading, isError } = useListings({
		page: currentPage,
		pageSize: 12,
		sort: strapiSort,
		attributeFilters:
			attributeFilters.length > 0 ? attributeFilters : undefined,
		subCategories: filters?.subcategories
			? filters.subcategories
			: undefined,
	});

	// Handle sort change from the sort dropdown
	const handleSortChange = (value: SortOption) => {
		setSortOption(value);
	};

	// Convert Strapi data to our component format
	const listings: ListingCardProps[] =
		data?.data.map((item: ListingData) => {
			const listing = item;

			const mainCategory =
				listing?.categories[0]?.name || "Uncategorized";

			return {
				id: item.id.toString(),
				title: listing.title,
				category: mainCategory,
				imageUrl:
					listing.images?.length > 0
						? getImageUrl(listing.images[0])
						: "/images/hero-image.png",
				createdAt: new Date(listing.createdAt),
			};
		}) || [];

	// Only update the sort option if it's coming from filters and is different
	useEffect(() => {
		if (filters?.sort && filters.sort !== sortOption) {
			setSortOption(filters.sort);
		}
	}, [filters?.sort, sortOption]);

	return (
		<div className="flex-1">
			{/* Header with sort and results count */}
			<div className="flex justify-between items-center mb-6">
				<p className="text-sm text-muted-foreground">
					{isLoading
						? "Loading listings..."
						: `${data?.meta.pagination?.total || 0} ${(data?.meta.pagination?.total || 0) === 1 ? "listing" : "listings"} found`}
				</p>
				<SortFilter
					selectedSort={sortOption}
					onChange={handleSortChange}
				/>
			</div>

			{/* Results grid */}
			{isLoading ? (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{Array.from({ length: 6 }).map((_, index) => (
						<ListingCardSkeleton key={index} />
					))}
				</div>
			) : isError ? (
				<div className="py-20 text-center">
					<h3 className="text-lg font-medium mb-2">
						Error loading listings
					</h3>
					<p className="text-muted-foreground">
						There was a problem fetching the listings. Please try
						again.
					</p>
				</div>
			) : listings.length > 0 ? (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{listings.map((listing) => (
						<ListingCard key={listing.id} {...listing} />
					))}
				</div>
			) : (
				<div className="py-20 text-center">
					<h3 className="text-lg font-medium mb-2">
						No listings found
					</h3>
					<p className="text-muted-foreground">
						Try adjusting your filters to find what you're looking
						for.
					</p>
				</div>
			)}
		</div>
	);
}
