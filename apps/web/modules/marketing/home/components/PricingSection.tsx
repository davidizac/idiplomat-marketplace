"use client";

import { Button } from "@ui/components/button";
import {
	ArrowRightIcon,
	Car,
	Laptop,
	Map as MapIcon,
	ShoppingBag,
	Sofa,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const popularCategories = [
	{
		name: "Vehicles",
		icon: Car,
		description: "Cars, motorcycles, diplomatic plates",
		count: 24,
	},
	{
		name: "Electronics",
		icon: Laptop,
		description: "Computers, phones, appliances",
		count: 18,
	},
	{
		name: "Furniture",
		icon: Sofa,
		description: "Home and office furniture",
		count: 15,
	},
];

const popularLocations = [
	{
		name: "Tel Aviv",
		count: 32,
		description: "Modern city with beaches and nightlife",
		bgColor: "bg-blue-500/50",
		textColor: "text-white",
		imageLink: "/images/cities/telaviv-jaffa.jpg",
	},
	{
		name: "Jerusalem",
		count: 27,
		description: "Historic and cultural center",
		bgColor: "bg-amber-600/50",
		textColor: "text-white",
		imageLink: "/images/cities/jerusalem.jpg",
	},
	{
		name: "Herzliya",
		count: 18,
		description: "Upscale coastal city",
		bgColor: "bg-cyan-500/60",
		textColor: "text-white",
		imageLink: "/images/cities/hertzilia.jpg",
	},
	{
		name: "Beer Sheva",
		count: 12,
		description: "Gateway to the Negev desert",
		bgColor: "bg-orange-700/50",
		textColor: "text-white",
		imageLink: "/images/cities/beer-sheva.jpg",
	},
];

export function PricingSection() {
	return (
		<section className="py-20 bg-gradient-to-b from-background to-muted/20">
			<div className="container max-w-6xl">
				<div className="mb-12 text-center">
					<h2 className="font-bold text-4xl mb-4">
						Find What You're Looking For
					</h2>
					<p className="text-lg text-foreground/60 max-w-2xl mx-auto">
						Browse listings by category or location to find exactly
						what you need within the diplomatic community.
					</p>
				</div>

				{/* Popular Categories */}
				<div className="mb-16">
					<div className="flex items-center justify-between mb-6">
						<h3 className="text-2xl font-bold">
							Popular Categories
						</h3>
						<Button variant="ghost" size="sm" asChild>
							<Link href="/categories">
								View all categories
								<ArrowRightIcon className="ml-2 h-4 w-4" />
							</Link>
						</Button>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						{popularCategories.map((category) => (
							<Link
								key={category.name}
								href={`/category/${category.name.toLowerCase()}`}
								className="flex items-start p-4 bg-card rounded-lg border shadow-sm hover:shadow-md transition-all"
							>
								<div className="p-3 mr-4 rounded-full bg-primary/10 text-primary">
									<category.icon className="h-6 w-6" />
								</div>
								<div className="flex-1">
									<h4 className="font-medium">
										{category.name}
									</h4>
									<p className="text-sm text-foreground/60 mb-2">
										{category.description}
									</p>
									<div className="bg-primary/10 text-primary rounded-full px-2 py-1 text-xs font-medium w-fit">
										{category.count} listings
									</div>
								</div>
							</Link>
						))}
					</div>
				</div>

				{/* Featured Locations */}
				<div className="mb-16">
					<div className="flex items-center justify-between mb-6">
						<h3 className="text-2xl font-bold">
							Featured Locations
						</h3>
						<div className="flex items-center">
							<MapIcon className="h-5 w-5 text-foreground/60 mr-2" />
							<span className="text-sm text-foreground/80">
								Israel
							</span>
						</div>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
						{popularLocations.map((location) => (
							<Link
								key={location.name}
								href={`/location/${location.name.toLowerCase()}`}
								className="group overflow-hidden rounded-xl border shadow-sm bg-card transition-all hover:shadow-md hover:border-primary/20"
							>
								<div className="relative h-48 overflow-hidden">
									<Image
										src={location.imageLink}
										alt={`${location.name} cityscape`}
										fill
										className="object-cover transition-transform group-hover:scale-105"
										sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
									/>
									<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
									<div className="absolute bottom-0 left-0 p-4 text-white">
										<h4 className="text-xl font-bold">
											{location.name}
										</h4>
										<p className="text-sm opacity-80">
											{location.description}
										</p>
									</div>
								</div>
								<div className="p-4 flex justify-between items-center">
									<span className="text-sm font-medium">
										{location.count} listings
									</span>
									<Button
										variant="ghost"
										size="sm"
										className="group-hover:bg-primary/10 group-hover:text-primary"
									>
										View listings
										<ArrowRightIcon className="ml-1 h-3 w-3" />
									</Button>
								</div>
							</Link>
						))}
					</div>

					<div className="mt-6 text-center">
						<Button variant="outline" className="mt-4" asChild>
							<Link href="/locations">
								Explore all locations
								<ArrowRightIcon className="ml-2 h-4 w-4" />
							</Link>
						</Button>
					</div>
				</div>

				{/* Call to Action */}
				<div className="bg-card rounded-xl border overflow-hidden shadow-md">
					<div className="p-8 text-center">
						<h3 className="text-2xl font-bold mb-2">
							Want to sell something?
						</h3>
						<p className="text-foreground/60 mb-6 max-w-lg mx-auto">
							As a diplomat, you can easily list your items for
							sale and connect with potential buyers in the
							community.
						</p>
						<Button size="lg" asChild>
							<Link href="/create-listing">
								<ShoppingBag className="mr-2 h-5 w-5" />
								Post a Listing Now
							</Link>
						</Button>
					</div>
				</div>
			</div>
		</section>
	);
}
