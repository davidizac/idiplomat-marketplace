"use client";

import { Card } from "@ui/components/card";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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

interface ListingsGridProps {
	filters?: FilterState;
}

export function ListingsGrid({ filters }: ListingsGridProps) {
	// Memoize the sample listings data so that its reference is stable across renders
	const allListings: ListingCardProps[] = useMemo(
		() => [
			{
				id: "1",
				title: "Modern Dining Table",
				price: 599,
				location: "Tel Aviv",
				category: "Furniture",
				condition: "Like New",
				imageUrl: "/images/hero-image.png",
				createdAt: new Date(2023, 11, 15),
			},
			{
				id: "2",
				title: "MacBook Pro 2022",
				price: 1299,
				location: "Jerusalem",
				category: "Electronics",
				condition: "New",
				imageUrl: "/images/hero-image.png",
				createdAt: new Date(2023, 11, 20),
			},
			{
				id: "3",
				title: "Leather Couch",
				price: 850,
				location: "Haifa",
				category: "Furniture",
				condition: "Good",
				imageUrl: "/images/hero-image.png",
				createdAt: new Date(2023, 10, 5),
			},
			{
				id: "4",
				title: "iPhone 14 Pro",
				price: 899,
				location: "Tel Aviv",
				category: "Electronics",
				condition: "Like New",
				imageUrl: "/images/hero-image.png",
				createdAt: new Date(2023, 11, 25),
			},
			{
				id: "5",
				title: "Dining Chairs (Set of 4)",
				price: 299,
				location: "Beer Sheva",
				category: "Furniture",
				condition: "Good",
				imageUrl: "/images/hero-image.png",
				createdAt: new Date(2023, 9, 10),
			},
			{
				id: "6",
				title: "Nespresso Coffee Machine",
				price: 149,
				location: "Jerusalem",
				category: "Appliances",
				condition: "New",
				imageUrl: "/images/hero-image.png",
				createdAt: new Date(2023, 11, 1),
			},
			{
				id: "7",
				title: "Diplomatic License Plates",
				price: 200,
				location: "Tel Aviv",
				category: "Vehicles",
				condition: "New",
				imageUrl: "/images/hero-image.png",
				createdAt: new Date(2023, 11, 28),
			},
			{
				id: "8",
				title: "Persian Rug - Handmade 6x9",
				price: 1250,
				location: "Haifa",
				category: "Furniture",
				condition: "Like New",
				imageUrl: "/images/hero-image.png",
				createdAt: new Date(2023, 10, 22),
			},
			{
				id: "9",
				title: 'Sony Bravia 65" TV',
				price: 780,
				location: "Tel Aviv",
				category: "Electronics",
				condition: "Good",
				imageUrl: "/images/hero-image.png",
				createdAt: new Date(2023, 11, 5),
			},
			{
				id: "10",
				title: "Toyota Land Cruiser 2020",
				price: 45000,
				location: "Jerusalem",
				category: "Vehicles",
				condition: "Like New",
				imageUrl: "/images/hero-image.png",
				createdAt: new Date(2023, 10, 15),
			},
			{
				id: "11",
				title: "Bosch Dishwasher",
				price: 350,
				location: "Beer Sheva",
				category: "Appliances",
				condition: "Good",
				imageUrl: "/images/hero-image.png",
				createdAt: new Date(2023, 9, 25),
			},
			{
				id: "12",
				title: "Formal Diplomatic Attire",
				price: 450,
				location: "Tel Aviv",
				category: "Clothing",
				condition: "Like New",
				imageUrl: "/images/hero-image.png",
				createdAt: new Date(2023, 11, 10),
			},
		],
		[],
	);

	const [sortOption, setSortOption] = useState<SortOption>("newest");
	const [filteredListings, setFilteredListings] =
		useState<ListingCardProps[]>(allListings);

	// Apply filters and sorting whenever filters change
	useEffect(() => {
		let result = [...allListings];

		// Apply category filter
		if (filters?.categories && filters.categories.length > 0) {
			result = result.filter((listing) =>
				filters.categories.includes(listing.category.toLowerCase()),
			);
		}

		// Apply price filter
		if (filters?.priceRange) {
			const [min, max] = filters.priceRange;
			result = result.filter(
				(listing) => listing.price >= min && listing.price <= max,
			);
		}

		// Apply location filter
		if (filters?.location && filters.location !== "all") {
			result = result.filter(
				(listing) =>
					listing.location.toLowerCase() === filters.location,
			);
		}

		// Apply condition filter
		if (filters?.conditions && filters.conditions.length > 0) {
			result = result.filter((listing) =>
				filters.conditions.includes(
					listing.condition.toLowerCase().replace(" ", "-"),
				),
			);
		}

		// Apply sorting
		const sortBy = filters?.sort || sortOption;

		switch (sortBy) {
			case "price-low-high":
				result.sort((a, b) => a.price - b.price);
				break;
			case "price-high-low":
				result.sort((a, b) => b.price - a.price);
				break;
			default:
				// newest first
				result.sort(
					(a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
				);
				break;
		}

		setFilteredListings(result);

		// Only update the sort option if it's coming from filters and is different
		if (filters?.sort && filters.sort !== sortOption) {
			setSortOption(filters.sort);
		}
	}, [filters, sortOption, allListings]);

	// Handle sort change from the sort dropdown
	const handleSortChange = (value: SortOption) => {
		setSortOption(value);
	};

	return (
		<div className="flex-1">
			{/* Header with sort and results count */}
			<div className="flex justify-between items-center mb-6">
				<p className="text-sm text-muted-foreground">
					{filteredListings.length}{" "}
					{filteredListings.length === 1 ? "listing" : "listings"}{" "}
					found
				</p>
				<SortFilter
					selectedSort={sortOption}
					onChange={handleSortChange}
				/>
			</div>

			{/* Results grid */}
			{filteredListings.length > 0 ? (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{filteredListings.map((listing) => (
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
