"use client";

import { Label } from "@ui/components/label";

interface CategoryFilterProps {
	onChange: (categories: string[]) => void;
	selectedCategories: string[];
}

interface Category {
	id: string;
	name: string;
}

export const categories: Category[] = [
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
	const handleChange = (categoryId: string) => {
		if (selectedCategories.includes(categoryId)) {
			onChange(selectedCategories.filter((id) => id !== categoryId));
		} else {
			onChange([...selectedCategories, categoryId]);
		}
	};

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
