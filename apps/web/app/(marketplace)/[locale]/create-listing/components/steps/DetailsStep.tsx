"use client";

import { useCategories } from "@marketplace/api";
import { useCategoryBySlug } from "@marketplace/api";
import type { Attribute } from "@repo/cms";
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
import { Skeleton } from "@ui/components/skeleton";
import { Textarea } from "@ui/components/textarea";
import { useCallback, useEffect, useMemo, useState } from "react";
import AttributeInputs from "./AttributeInputs";

interface FormState {
	category: string;
	subCategory: string;
	title: string;
	description: string;
	attributes: Array<{
		attributeDocumentId: string;
		attributeName: string;
		value: string;
	}>;
	[key: string]: any;
}

interface DetailsStepProps {
	formState: FormState;
	updateField: (field: string, value: any) => void;
	onNext: () => void;
}

// Fallback category data in case API fails
const fallbackCategories = [
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
	const [categoryAttributes, setCategoryAttributes] = useState<Attribute[]>(
		[],
	);
	const [subCategoryAttributes, setSubCategoryAttributes] = useState<
		Attribute[]
	>([]);
	const [combinedAttributes, setCombinedAttributes] = useState<Attribute[]>(
		[],
	);

	// Fetch categories from Strapi
	const { data: categoriesData, isLoading, isError } = useCategories();

	// Log the raw category data when it changes
	useEffect(() => {
		if (categoriesData?.data) {
			console.log("Raw categories data from API:", categoriesData.data);
		}
	}, [categoriesData]);

	// Fetch category details when selected
	const { data: categoryData, isLoading: isCategoryLoading } =
		useCategoryBySlug(formState.category, Boolean(formState.category));

	// Fetch subcategory details when selected
	const { data: subCategoryData, isLoading: isSubCategoryLoading } =
		useCategoryBySlug(
			formState.subCategory,
			Boolean(formState.subCategory),
		);

	// Process categories from Strapi to match our structure
	const categories = useMemo(() => {
		if (!isLoading && !isError && categoriesData?.data) {
			return categoriesData.data.map((category) => {
				// Properly extract subcategories from the category data
				let subcategories: Array<{ id: string; name: string }> = [];
				if (category.categories && Array.isArray(category.categories)) {
					subcategories = category.categories.map((subcategory) => ({
						id: subcategory.slug,
						name: subcategory.name,
					}));
				}

				return {
					id: category.slug,
					name: category.name,
					subCategories: subcategories,
				};
			});
		}
		return fallbackCategories;
	}, [categoriesData, isLoading, isError]);

	// Update category attributes when category data changes
	useEffect(() => {
		if (categoryData) {
			setCategoryAttributes(categoryData.attributes || []);
		} else {
			setCategoryAttributes([]);
		}
	}, [categoryData]);

	// Update subcategory attributes when subcategory data changes
	useEffect(() => {
		if (subCategoryData) {
			setSubCategoryAttributes(subCategoryData.attributes || []);
		} else {
			setSubCategoryAttributes([]);
		}
	}, [subCategoryData]);

	// Combine attributes from category and subcategory, avoiding duplicates
	useEffect(() => {
		const allAttributes = [...categoryAttributes];

		// Add subcategory attributes, avoiding duplicates by name
		subCategoryAttributes.forEach((subAttr) => {
			if (!allAttributes.some((attr) => attr.name === subAttr.name)) {
				allAttributes.push(subAttr);
			}
		});

		setCombinedAttributes(allAttributes);
	}, [categoryAttributes, subCategoryAttributes]);

	// Add specific debug logging for category data
	useEffect(() => {
		if (categoryData) {
			console.log("Selected category data from API:", categoryData);
			console.log(
				"Subcategories from selected category:",
				categoryData.categories,
			);
		}
	}, [categoryData]);

	// Get subcategories based on selected category using a memo
	const subcategories = useMemo(() => {
		// Find the category by its slug
		const selectedCategory = categories.find(
			(c) => c.id === formState.category,
		);

		if (selectedCategory) {
			// Debug information
			if (process.env.NODE_ENV === "development") {
				console.log(
					"useMemo subcategories - found category:",
					selectedCategory,
				);
				console.log("Subcategories:", selectedCategory.subCategories);
			}
			return selectedCategory.subCategories || [];
		}

		return [];
	}, [categories, formState.category]);

	// Update attributes in form state
	const updateAttributes = useCallback(
		(
			attributes: Array<{
				attributeDocumentId: string;
				attributeName: string;
				value: string;
			}>,
		) => {
			updateField("attributes", attributes);
		},
		[updateField],
	);

	// Validate the form before moving to the next step
	const validateForm = () => {
		const newErrors: Record<string, string> = {};

		if (!formState.category) {
			newErrors.category = "Category is required";
		}

		if (!formState.subCategory && subcategories.length > 0) {
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

		// Validate required attributes
		combinedAttributes.forEach((attr) => {
			if (attr.required) {
				const attributeValue = formState.attributes.find(
					(a) => a.attributeDocumentId === attr.documentId,
				);
				if (!attributeValue || !attributeValue.value) {
					newErrors[`attribute-${attr.id}`] =
						`${attr.name} is required`;
				}
			}
		});

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	// Handle next button click
	const handleNext = () => {
		if (validateForm()) {
			onNext();
		}
	};

	// Update form state and save category ID for API submission
	const handleCategoryChange = (value: string) => {
		// Skip if the value hasn't changed
		if (value === formState.category) return;

		updateField("category", value);
		updateField("subCategory", ""); // Reset subcategory when category changes
		updateField("attributes", []); // Reset attributes when category changes

		// Find the full category object to save its ID
		const category = categoriesData?.data.find((c) => c.slug === value);
		if (category) {
			updateField("categoryId", category.documentId);
		}
	};

	// Update form state and save subcategory ID for API submission
	const handleSubCategoryChange = (value: string) => {
		// Skip if the value hasn't changed
		if (value === formState.subCategory) return;

		console.log("Selected subcategory value:", value);

		updateField("subCategory", value);

		// Find the full subcategory object from the category data
		const subcategory = categoryData?.categories?.find(
			(c) => c.slug === value,
		);
		console.log("Found subcategory data:", subcategory);

		if (subcategory) {
			updateField("subCategoryId", subcategory.documentId);
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
					{isLoading ? (
						<Skeleton className="h-10 w-full" />
					) : (
						<Select
							value={formState.category}
							onValueChange={handleCategoryChange}
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
					)}
					{errors.category && (
						<p className="text-sm text-destructive">
							{errors.category}
						</p>
					)}
				</div>

				<div className="space-y-2">
					<Label htmlFor="subCategory">Sub-Category</Label>
					{isLoading ? (
						<Skeleton className="h-10 w-full" />
					) : (
						<>
							<Select
								value={formState.subCategory}
								onValueChange={handleSubCategoryChange}
								disabled={
									!formState.category ||
									subcategories.length === 0
								}
							>
								<SelectTrigger
									id="subCategory"
									className="w-full"
								>
									<SelectValue
										placeholder={
											subcategories.length > 0
												? "Select a sub-category"
												: "No subcategories available"
										}
									/>
								</SelectTrigger>
								<SelectContent>
									{subcategories.map((subCategory) => (
										<SelectItem
											key={subCategory.id}
											value={subCategory.id}
										>
											{subCategory.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							{formState.category &&
								subcategories.length === 0 && (
									<p className="text-xs text-muted-foreground mt-1">
										This category doesn't have any
										subcategories
									</p>
								)}
							{process.env.NODE_ENV === "development" && (
								<div className="text-xs text-muted-foreground mt-1">
									<p>
										Selected category: {formState.category}
									</p>
									<p>
										Available subcategories:{" "}
										{subcategories.length}
									</p>
								</div>
							)}
						</>
					)}
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

			{/* Dynamic Attributes */}
			{(isCategoryLoading || isSubCategoryLoading) &&
			formState.category ? (
				<div className="space-y-4">
					<Skeleton className="h-8 w-1/3" />
					<Skeleton className="h-10 w-full" />
					<Skeleton className="h-10 w-full" />
				</div>
			) : (
				<AttributeInputs
					attributes={combinedAttributes}
					values={formState.attributes}
					updateAttributes={updateAttributes}
					errors={errors}
				/>
			)}

			<div className="flex justify-end">
				<Button type="button" onClick={handleNext}>
					Continue to Pricing
				</Button>
			</div>
		</div>
	);
}
