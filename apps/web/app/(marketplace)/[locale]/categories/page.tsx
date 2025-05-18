"use client";

import { Button } from "@ui/components/button";
import { Input } from "@ui/components/input";
import { Search } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
	getImageUrl,
	useCategories,
} from "../../../../modules/marketplace/api";

export default function CategoriesPage() {
	const router = useRouter();
	const {
		data: categoriesResponse,
		isLoading,
		error,
	} = useCategories({
		pageSize: 100, // Get all categories
	});
	const [searchTerm, setSearchTerm] = useState("");

	if (isLoading) {
		return (
			<div className="container py-16 flex justify-center">
				<div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
			</div>
		);
	}

	if (error) {
		return (
			<div className="container py-16 text-center">
				<h2 className="text-2xl font-bold text-red-500">
					Failed to load categories
				</h2>
				<p className="mt-2 text-muted-foreground">
					Please try again later
				</p>
			</div>
		);
	}

	// Filter root categories (those without a parent)
	const allCategories = categoriesResponse?.data || [];
	const rootCategories = allCategories.filter((category) => !category.parent);

	// Filter categories based on search term
	const filteredCategories = searchTerm
		? rootCategories.filter(
				(category) =>
					category.name
						.toLowerCase()
						.includes(searchTerm.toLowerCase()) ||
					(category.description &&
						category.description
							.toLowerCase()
							.includes(searchTerm.toLowerCase())),
			)
		: rootCategories;

	const handleCategorySelect = (categorySlug: string) => {
		router.push(`/listings?category=${categorySlug}`);
	};

	return (
		<div className="container py-12 md:py-20">
			<div className="max-w-4xl mx-auto text-center mb-8">
				<h1 className="text-3xl md:text-4xl font-bold mb-4">
					Browse Categories
				</h1>
				<p className="text-lg text-muted-foreground mb-6">
					Find exactly what you're looking for by selecting a category
				</p>
				<div className="max-w-md mx-auto">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							placeholder="Search categories..."
							className="pl-10 pr-4 py-2"
						/>
					</div>
				</div>
			</div>

			{filteredCategories.length === 0 ? (
				<div className="text-center py-12">
					<h3 className="text-xl font-medium mb-2">
						No matching categories
					</h3>
					<p className="text-muted-foreground">
						Try a different search term
					</p>
					<Button
						variant="outline"
						className="mt-4"
						onClick={() => setSearchTerm("")}
					>
						Clear Search
					</Button>
				</div>
			) : (
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
					{filteredCategories.map((category) => (
						<button
							key={category.id}
							type="button"
							className="bg-card rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow group cursor-pointer text-left"
							onClick={() => handleCategorySelect(category.slug)}
							aria-label={`Select ${category.name} category`}
						>
							<div className="aspect-square relative overflow-hidden">
								{category.image ? (
									<Image
										src={getImageUrl(category.image)}
										alt={category.name}
										fill
										className="object-cover group-hover:scale-105 transition-transform duration-300"
										sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
									/>
								) : (
									<div className="w-full h-full bg-muted flex items-center justify-center">
										<span className="text-3xl">🏷️</span>
									</div>
								)}

								<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
									<span className="text-white font-medium p-4 w-full">
										Browse {category.name}
									</span>
								</div>
							</div>
							<div className="p-4">
								<h3 className="font-semibold text-lg mb-1">
									{category.name}
								</h3>
								{category.description && (
									<p className="text-muted-foreground text-sm line-clamp-2">
										{category.description}
									</p>
								)}
							</div>
						</button>
					))}
				</div>
			)}
		</div>
	);
}
