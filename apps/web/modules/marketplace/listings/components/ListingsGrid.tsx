"use client";

import { LocaleLink } from "@i18n/routing";
import {
	type ListingData,
	type ListingFilterParams,
	useListings,
} from "@marketplace/api";
import { type Category, getStrapiImageUrl } from "@repo/cms";
import { Card } from "@ui/components/card";
import { Skeleton } from "@ui/components/skeleton";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { SortFilter, type SortOption } from "./filters/SortFilter";
import { SubcategoryChips } from "./filters/SubcategoryChips";

interface ListingCardProps {
	id: string;
	title: string;
	imageUrl: string;
	createdAt: Date;
	documentId: string;
	type: "rent" | "sale" | "free";
	price?: number;
	rental_price?: number;
	rental_period?: "hourly" | "daily" | "weekly" | "monthly";
}

function ListingCard({
	title,
	imageUrl,
	documentId,
	type,
	price,
	rental_price,
	rental_period,
}: ListingCardProps) {
	const t = useTranslations("marketplace.listings");
	// Helper function to format price display
	const formatPrice = () => {
		if (type === "free") {
			return t("free");
		}
		if (type === "sale" && price) {
			return `₪${price}`;
		}
		if (type === "rent" && rental_price && rental_period) {
			const periodMap = {
				hourly: "hr",
				daily: "day",
				weekly: "week",
				monthly: "month",
			};
			return `₪${rental_price}/${periodMap[rental_period]}`;
		}
		return t("priceNotSet");
	};
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
						<span className="font-bold text-lg ml-2">
							{formatPrice()}
						</span>
					</div>
					<div className="mt-2 flex items-center text-sm text-muted-foreground">
						{/* <span>{location}</span> */}
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
	selectedCategory: Category | null;
	selectedSubcategory: Category | null;
	onSelectSubcategory: (subcategory: Category | null) => void;
}

// Helper to process listings data
function processListings(data: any): ListingCardProps[] {
	return (
		data?.data.map((item: ListingData) => {
			const listing = item;

			return {
				id: item.id.toString(),
				documentId: item.documentId,
				title: listing.title,
				imageUrl:
					listing.images?.length > 0
						? getStrapiImageUrl(listing.images[0].url)
						: "/images/hero-image.png",
				createdAt: new Date(listing.createdAt),
				type: listing.type || "sale",
				price: listing.price,
				rental_price: listing.rental_price,
				rental_period: listing.rental_period,
			};
		}) || []
	);
}

export function ListingsGrid({
	strapiQuery,
	onSortChange,
	selectedCategory,
	selectedSubcategory,
	onSelectSubcategory,
}: ListingsGridProps) {
	const t = useTranslations("marketplace.listings");
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

	// Get subcategories from selected category
	const subcategories = selectedCategory?.categories || [];

	return (
		<div className="flex-1 w-full">
			{/* Subcategory Chips (desktop only - if category is selected and has subcategories) */}
			{selectedCategory && subcategories.length > 0 && (
				<div className="hidden lg:block mb-6">
					<SubcategoryChips
						subcategories={subcategories}
						selectedSubcategory={selectedSubcategory}
						onSelectSubcategory={onSelectSubcategory}
					/>
				</div>
			)}

			{/* Header with sort and results count */}
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
				<p className="text-sm text-muted-foreground">
					{isLoading
						? t("loading")
						: t("listingCount", { count: data?.pagination?.total || 0 })}
				</p>
				<SortFilter
					selectedSort={sortOption}
					onChange={handleSortChange}
				/>
			</div>

			{/* Results grid */}
			{isLoading ? (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
					{Array.from({ length: 6 }).map((_, index) => (
						<ListingCardSkeleton key={index} />
					))}
				</div>
			) : isError ? (
				<div className="py-20 text-center">
					<h3 className="text-lg font-medium mb-2">
						{t("errorTitle")}
					</h3>
					<p className="text-muted-foreground">
						{t("errorDesc")}
					</p>
				</div>
			) : listings.length > 0 ? (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
					{listings.map((listing) => (
						<ListingCard key={listing.id} {...listing} />
					))}
				</div>
			) : (
				<div className="py-20 text-center">
					<h3 className="text-lg font-medium mb-2">
						{t("noResultsTitle")}
					</h3>
					<p className="text-muted-foreground">
						{t("noResultsDesc")}
					</p>
				</div>
			)}
		</div>
	);
}
