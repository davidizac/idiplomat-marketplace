"use client";
import { categoryService } from "@repo/cms";
import type { Attribute, Category } from "@repo/cms";
import { useQuery } from "@tanstack/react-query";
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
import { useCallback, useEffect, useState } from "react";
import AttributeInputs from "./AttributeInputs";

interface FormState {
	categories: Array<{
		slug: string;
		name: string;
		documentId: string;
		level: number;
	}>;
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

// Simplified category dropdown structure
interface CategoryLevel {
	level: number;
	isLoading: boolean;
	categories: Category[];
	selectedSlug: string;
	parentSlug?: string;
}

export default function DetailsStep({
	formState,
	updateField,
	onNext,
}: DetailsStepProps) {
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [allCategoryAttributes, setAllCategoryAttributes] = useState<
		Attribute[]
	>([]);
	const [levels, setLevels] = useState<CategoryLevel[]>([]);

	// Fetch root categories
	const { data: rootCategories, isLoading: isRootCategoriesLoading } =
		useQuery({
			queryKey: ["root-categories"],
			queryFn: async () => {
				console.log("Fetching root categories");
				const result = await categoryService.getRootCategories();
				console.log("Root categories:", result.data);
				return result.data;
			},
		});

	// Initialize with root categories
	useEffect(() => {
		if (rootCategories && !isRootCategoriesLoading) {
			setLevels([
				{
					level: 0,
					isLoading: false,
					categories: rootCategories,
					selectedSlug: "",
				},
			]);
		}
	}, [rootCategories, isRootCategoriesLoading]);

	// Initialize form state if needed
	useEffect(() => {
		if (!formState.categories) {
			updateField("categories", []);
		}
	}, [formState, updateField]);

	// Handle category selection
	const handleCategorySelect = async (level: number, slug: string) => {
		if (!slug) return;

		try {
			console.log(`Selecting category at level ${level}, slug: ${slug}`);

			// 1. Update the current level's selection
			setLevels((prev) => {
				const newLevels = [...prev];
				newLevels[level] = {
					...newLevels[level],
					selectedSlug: slug,
					isLoading: true,
				};

				// Remove any deeper levels
				return newLevels.slice(0, level + 1);
			});

			// 2. Fetch the category details
			const categoryDetails =
				await categoryService.getCategoryBySlug(slug);
			console.log(`Category details for ${slug}:`, categoryDetails);

			// 3. Update attributes
			if (categoryDetails.attributes) {
				setAllCategoryAttributes((prev) => {
					const attrMap = new Map(
						prev.map((attr) => [attr.documentId, attr]),
					);
					categoryDetails.attributes.forEach((attr) => {
						attrMap.set(attr.documentId, attr);
					});
					return Array.from(attrMap.values());
				});
			}

			// 4. Check for subcategories
			const hasSubcategories = categoryDetails.categories?.length > 0;
			console.log(`${slug} has subcategories:`, hasSubcategories);

			if (hasSubcategories) {
				// Add a new level for subcategories
				setLevels((prev) => {
					const newLevels = [...prev];
					newLevels[level] = {
						...newLevels[level],
						isLoading: false,
					};

					// Add the next level
					newLevels.push({
						level: level + 1,
						isLoading: false,
						categories: categoryDetails.categories,
						selectedSlug: "",
						parentSlug: slug,
					});

					return newLevels;
				});
			} else {
				// Just update loading state
				setLevels((prev) => {
					const newLevels = [...prev];
					newLevels[level] = {
						...newLevels[level],
						isLoading: false,
					};
					return newLevels;
				});
			}

			// 5. Update selected categories in form state
			const newCategories = formState.categories
				.filter((cat) => cat.level < level)
				.concat({
					level,
					slug,
					name: categoryDetails.name,
					documentId: categoryDetails.documentId,
				});

			updateField("categories", newCategories);
		} catch (error) {
			console.error("Error selecting category:", error);

			// Reset loading state on error
			setLevels((prev) => {
				const newLevels = [...prev];
				if (newLevels[level]) {
					newLevels[level] = {
						...newLevels[level],
						isLoading: false,
					};
				}
				return newLevels;
			});
		}
	};

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

		// Require at least one category
		if (!formState.categories || formState.categories.length === 0) {
			newErrors.category = "Category is required";
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
		allCategoryAttributes.forEach((attr) => {
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

	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<h2 className="text-2xl font-bold">Listing Details</h2>
				<p className="text-muted-foreground">
					Provide basic information about your listing.
				</p>
			</div>

			{/* Category Selection - Dynamic Dropdowns */}
			<div className="space-y-4">
				<div className="flex items-center space-x-2">
					<h3 className="font-medium">Categories</h3>
				</div>

				{/* Display category dropdowns for each level */}
				{levels.map((level, index) => (
					<div key={`category-level-${index}`} className="space-y-2">
						<Label htmlFor={`category-level-${index}`}>
							{index === 0
								? "Main Category"
								: `Subcategory (Level ${index + 1})`}
						</Label>

						{level.isLoading ? (
							<Skeleton className="h-10 w-full" />
						) : (
							<Select
								value={level.selectedSlug}
								onValueChange={(value) =>
									handleCategorySelect(index, value)
								}
							>
								<SelectTrigger
									id={`category-level-${index}`}
									className="w-full"
								>
									<SelectValue
										placeholder={`Select ${index === 0 ? "a category" : "a subcategory"}`}
									/>
								</SelectTrigger>
								<SelectContent>
									{level.categories.length === 0 ? (
										<div className="py-2 px-2 text-sm text-muted-foreground">
											No categories available
										</div>
									) : (
										level.categories.map((category) => (
											<SelectItem
												key={category.slug}
												value={category.slug}
											>
												{category.name}
											</SelectItem>
										))
									)}
								</SelectContent>
							</Select>
						)}

						{index === 0 && errors.category && (
							<p className="text-sm text-destructive">
								{errors.category}
							</p>
						)}
					</div>
				))}

				{/* Selected Categories Display */}
				{formState.categories && formState.categories.length > 0 && (
					<div className="text-sm text-muted-foreground pt-2">
						<p>
							Selected:{" "}
							{formState.categories
								.map((cat) => cat.name)
								.join(" → ")}
						</p>
					</div>
				)}

				{/* Debug information (only in development) */}
				{process.env.NODE_ENV === "development" && (
					<div className="mt-4 p-3 border border-dashed rounded-md text-xs">
						<p className="font-medium mb-1">Debug info:</p>
						<p>Active levels: {levels.length}</p>
						{levels.map((level, i) => (
							<div key={i} className="ml-2 mb-1">
								<p>
									Level {i}: {level.categories.length}{" "}
									categories, selected: "{level.selectedSlug}
									", loading: {level.isLoading.toString()}
								</p>
							</div>
						))}
						<p className="mt-2">
							Form categories: {formState.categories.length}
						</p>
						{formState.categories.map((cat, i) => (
							<div key={i} className="ml-2">
								<p>
									{i}: {cat.name} (level: {cat.level}, id:{" "}
									{cat.documentId})
								</p>
							</div>
						))}
					</div>
				)}
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
			{allCategoryAttributes.length > 0 && (
				<AttributeInputs
					attributes={allCategoryAttributes}
					values={formState.attributes || []}
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
