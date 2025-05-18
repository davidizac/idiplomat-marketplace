"use client";

import { type ListingData, getImageUrl, useListings } from "@marketplace/api";
import { Card } from "@ui/components/card";
import { Skeleton } from "@ui/components/skeleton";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SortFilter, type SortOption } from "./filters/SortFilter";

interface FilterState {
	categories: string[];
	priceRange: [number, number];
	location: string;
	conditions: string[];
	sort: SortOption;
}

interface ListingCardProps {
	id: string;
	title: string;
	price: number;
	location: string;
	category: string;
	condition: string;
	imageUrl: string;
	createdAt: Date;
}

function ListingCard({
	id,
	title,
	price,
	location,
	category,
	condition,
	imageUrl,
}: ListingCardProps) {
	return (
		<Link href={`/listings/${id}`}>
			<Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
				<div className="relative h-48">
					{/* <Image
						src={imageUrl || "/images/hero-image.png"}
						alt={title}
						fill
						className="object-cover"
						sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
					/> */}
				</div>
				<div className="p-4">
					<div className="flex items-start justify-between">
						<h3 className="font-semibold truncate flex-1">
							{title}
						</h3>
						<span className="font-bold text-lg ml-2">${price}</span>
					</div>
					<div className="mt-2 flex items-center text-sm text-muted-foreground">
						<span>{location}</span>
					</div>
					<div className="mt-3 flex gap-2">
						<div className="bg-secondary text-xs px-2 py-1 rounded-full">
							{category}
						</div>
						<div className="border text-xs px-2 py-1 rounded-full">
							{condition}
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
}

export function ListingsGrid({ filters }: ListingsGridProps) {
	const [sortOption, setSortOption] = useState<SortOption>("newest");
	const [currentPage, setCurrentPage] = useState<number>(1);

	// Convert filters to Strapi format
	const strapiFilters: Record<string, any> = {};

	if (filters?.categories && filters.categories.length > 0) {
		strapiFilters.categories = {
			name: {
				$in: filters.categories.map(
					(c) => c.charAt(0).toUpperCase() + c.slice(1),
				),
			},
		};
	}

	if (filters?.conditions && filters.conditions.length > 0) {
		strapiFilters.condition = {
			$in: filters.conditions.map((c) =>
				c
					.split("-")
					.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
					.join(" "),
			),
		};
	}

	if (filters?.location && filters.location !== "all") {
		strapiFilters.location = {
			$eq:
				filters.location.charAt(0).toUpperCase() +
				filters.location.slice(1),
		};
	}

	if (filters?.priceRange) {
		const [min, max] = filters.priceRange;
		if (min > 0) {
			strapiFilters.price = { $gte: min };
		}
		if (max < 5000) {
			// Assuming 5000 is the max in your range
			strapiFilters.price = { ...strapiFilters.price, $lte: max };
		}
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

	// Fetch listings from Strapi
	const { data, isLoading, isError } = useListings({
		page: currentPage,
		pageSize: 12,
		sort: strapiSort,
		filters:
			Object.keys(strapiFilters).length > 0 ? strapiFilters : undefined,
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
				price: listing.price || 0,
				location: listing.location || "Unknown",
				category: mainCategory,
				condition: listing.condition || "Unspecified",
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
