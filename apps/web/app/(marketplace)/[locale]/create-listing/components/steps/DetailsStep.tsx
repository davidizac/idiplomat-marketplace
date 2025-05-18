"use client";

import { Button } from "@ui/components/button";
import { Input } from "@ui/components/input";
import { Label } from "@ui/components/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@ui/components/select";
import { Textarea } from "@ui/components/textarea";
import { useState } from "react";

interface FormState {
	category: string;
	subCategory: string;
	title: string;
	description: string;
	[key: string]: any;
}

interface DetailsStepProps {
	formState: FormState;
	updateField: (field: string, value: any) => void;
	onNext: () => void;
}

// Sample category data
const categories = [
	{
		id: "furniture",
		name: "Furniture",
		subCategories: [
			{ id: "sofas", name: "Sofas & Armchairs" },
			{ id: "tables", name: "Tables & Desks" },
			{ id: "beds", name: "Beds & Mattresses" },
			{ id: "storage", name: "Storage & Shelving" },
		],
	},
	{
		id: "electronics",
		name: "Electronics",
		subCategories: [
			{ id: "phones", name: "Phones & Tablets" },
			{ id: "computers", name: "Computers & Laptops" },
			{ id: "tv", name: "TVs & Monitors" },
			{ id: "audio", name: "Audio Equipment" },
		],
	},
	{
		id: "vehicles",
		name: "Vehicles",
		subCategories: [
			{ id: "cars", name: "Cars" },
			{ id: "motorcycles", name: "Motorcycles" },
			{ id: "bicycles", name: "Bicycles" },
			{ id: "accessories", name: "Vehicle Accessories" },
		],
	},
	{
		id: "clothing",
		name: "Clothing",
		subCategories: [
			{ id: "mens", name: "Men's Clothing" },
			{ id: "womens", name: "Women's Clothing" },
			{ id: "kids", name: "Kids' Clothing" },
			{ id: "shoes", name: "Shoes & Accessories" },
		],
	},
];

export default function DetailsStep({
	formState,
	updateField,
	onNext,
}: DetailsStepProps) {
	const [errors, setErrors] = useState<Record<string, string>>({});

	// Get subcategories based on selected category
	const getSubCategories = () => {
		const selectedCategory = categories.find(
			(c) => c.id === formState.category,
		);
		return selectedCategory?.subCategories || [];
	};

	// Validate the form before moving to the next step
	const validateForm = () => {
		const newErrors: Record<string, string> = {};

		if (!formState.category) {
			newErrors.category = "Category is required";
		}

		if (!formState.subCategory) {
			newErrors.subCategory = "Sub-category is required";
		}

		if (!formState.title) {
			newErrors.title = "Title is required";
		} else if (formState.title.length < 5) {
			newErrors.title = "Title must be at least 5 characters";
		}

		if (!formState.description) {
			newErrors.description = "Description is required";
		} else if (formState.description.length < 20) {
			newErrors.description =
				"Description must be at least 20 characters";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	// Handle next button click
	const handleNext = () => {
		if (validateForm()) {
			onNext();
		}
	};

	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<h2 className="text-2xl font-bold">Listing Details</h2>
				<p className="text-muted-foreground">
					Provide basic information about your listing.
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div className="space-y-2">
					<Label htmlFor="category">Category</Label>
					<Select
						value={formState.category}
						onValueChange={(value) => {
							updateField("category", value);
							updateField("subCategory", ""); // Reset subcategory when category changes
						}}
					>
						<SelectTrigger id="category" className="w-full">
							<SelectValue placeholder="Select a category" />
						</SelectTrigger>
						<SelectContent>
							{categories.map((category) => (
								<SelectItem
									key={category.id}
									value={category.id}
								>
									{category.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					{errors.category && (
						<p className="text-sm text-destructive">
							{errors.category}
						</p>
					)}
				</div>

				<div className="space-y-2">
					<Label htmlFor="subCategory">Sub-Category</Label>
					<Select
						value={formState.subCategory}
						onValueChange={(value) =>
							updateField("subCategory", value)
						}
						disabled={!formState.category}
					>
						<SelectTrigger id="subCategory" className="w-full">
							<SelectValue placeholder="Select a sub-category" />
						</SelectTrigger>
						<SelectContent>
							{getSubCategories().map((subCategory) => (
								<SelectItem
									key={subCategory.id}
									value={subCategory.id}
								>
									{subCategory.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					{errors.subCategory && (
						<p className="text-sm text-destructive">
							{errors.subCategory}
						</p>
					)}
				</div>
			</div>

			<div className="space-y-2">
				<Label htmlFor="title">Title</Label>
				<Input
					id="title"
					placeholder="Enter a descriptive title"
					value={formState.title}
					onChange={(e) => updateField("title", e.target.value)}
				/>
				{errors.title && (
					<p className="text-sm text-destructive">{errors.title}</p>
				)}
			</div>

			<div className="space-y-2">
				<Label htmlFor="description">Description</Label>
				<Textarea
					id="description"
					placeholder="Describe your item in detail (condition, features, etc.)"
					className="min-h-[150px]"
					value={formState.description}
					onChange={(e) => updateField("description", e.target.value)}
				/>
				{errors.description && (
					<p className="text-sm text-destructive">
						{errors.description}
					</p>
				)}
			</div>

			<div className="flex justify-end">
				<Button type="button" onClick={handleNext}>
					Continue to Pricing
				</Button>
			</div>
		</div>
	);
}
