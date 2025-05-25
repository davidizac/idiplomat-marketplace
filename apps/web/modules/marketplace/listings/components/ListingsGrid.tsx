"use client";

import { LocaleLink } from "@i18n/routing";
import {
	type ListingData,
	type ListingFilterParams,
	useListings,
} from "@marketplace/api";
import { getStrapiImageUrl } from "@repo/cms";
import { Card } from "@ui/components/card";
import { Skeleton } from "@ui/components/skeleton";
import Image from "next/image";
import { useState } from "react";
import { SortFilter, type SortOption } from "./filters/SortFilter";

interface ListingCardProps {
	id: string;
	title: string;
	category: string;
	imageUrl: string;
	createdAt: Date;
	documentId: string;
}

function ListingCard({
	id,
	title,
	category,
	imageUrl,
	documentId,
}: ListingCardProps) {
	return (
		<LocaleLink href={`/listings/${documentId}`}>
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
		</LocaleLink>
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
	strapiQuery: ListingFilterParams;
	onSortChange?: (sort: SortOption) => void;
}

// Helper to process listings data
function processListings(data: any): ListingCardProps[] {
	return (
		data?.data.map((item: ListingData) => {
			const listing = item;
			const mainCategory =
				listing?.categories[0]?.name || "Uncategorized";

			return {
				id: item.id.toString(),
				documentId: item.documentId,
				title: listing.title,
				category: mainCategory,
				imageUrl:
					listing.images?.length > 0
						? getStrapiImageUrl(listing.images[0].url)
						: "/images/hero-image.png",
				createdAt: new Date(listing.createdAt),
			};
		}) || []
	);
}

export function ListingsGrid({ strapiQuery, onSortChange }: ListingsGridProps) {
	const [sortOption, setSortOption] = useState<SortOption>(
		(strapiQuery.sort?.startsWith("price:asc")
			? "price-low-high"
			: strapiQuery.sort?.startsWith("price:desc")
				? "price-high-low"
				: "newest") as SortOption,
	);
	const [currentPage, setCurrentPage] = useState<number>(
		strapiQuery.page || 1,
	);

	// Handle sort change from the sort dropdown
	function handleSortChange(value: SortOption) {
		setSortOption(value);
		if (onSortChange) {
			onSortChange(value);
		}
	}

	// Fetch listings using the strapiQuery
	const { data, isLoading, isError } = useListings({
		...strapiQuery,
		page: currentPage,
	});

	// Process listings
	const listings = processListings(data);

	return (
		<div className="flex-1">
			{/* Header with sort and results count */}
			<div className="flex justify-between items-center mb-6">
				<p className="text-sm text-muted-foreground">
					{isLoading
						? "Loading listings..."
						: `${data?.pagination?.total || 0} ${data?.pagination?.total === 1 ? "listing" : "listings"} found`}
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
