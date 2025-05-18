"use client";

import { useCategories } from "@marketplace/api";
import { Label } from "@ui/components/label";
import { Skeleton } from "@ui/components/skeleton";

interface CategoryFilterProps {
	onChange: (categories: string[]) => void;
	selectedCategories: string[];
}

interface Category {
	id: string;
	name: string;
}

// Fallback categories in case API fails
const fallbackCategories: Category[] = [
	{ id: "furniture", name: "Furniture" },
	{ id: "electronics", name: "Electronics" },
	{ id: "vehicles", name: "Vehicles" },
	{ id: "appliances", name: "Appliances" },
	{ id: "clothing", name: "Clothing" },
];

export function CategoryFilter({
	onChange,
	selectedCategories,
}: CategoryFilterProps) {
	// Fetch categories from Strapi
	const { data, isLoading, isError } = useCategories();
	console.log(data);
	// Map Strapi categories to our component format
	const categories: Category[] =
		!isLoading && !isError && data?.data
			? data.data.map((item) => ({
					id: item.slug.toLowerCase(),
					name: item.name,
				}))
			: fallbackCategories;

	const handleChange = (categoryId: string) => {
		if (selectedCategories.includes(categoryId)) {
			onChange(selectedCategories.filter((id) => id !== categoryId));
		} else {
			onChange([...selectedCategories, categoryId]);
		}
	};

	if (isLoading) {
		return (
			<div className="space-y-4">
				<h3 className="font-semibold">Categories</h3>
				<div className="space-y-2">
					{Array.from({ length: 5 }).map((_, index) => (
						<div
							key={index}
							className="flex items-center space-x-2"
						>
							<Skeleton className="h-4 w-4 rounded" />
							<Skeleton className="h-4 w-24" />
						</div>
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<h3 className="font-semibold">Categories</h3>
			<div className="space-y-2">
				{categories.map((category) => (
					<div
						key={category.id}
						className="flex items-center space-x-2"
					>
						<input
							id={category.id}
							type="checkbox"
							className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
							checked={selectedCategories.includes(category.id)}
							onChange={() => handleChange(category.id)}
						/>
						<Label htmlFor={category.id}>{category.name}</Label>
					</div>
				))}
			</div>
		</div>
	);
}
