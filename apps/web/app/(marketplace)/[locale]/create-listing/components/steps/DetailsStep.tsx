"use client";
import type {} from "@repo/cms";
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
import { useCallback, useState } from "react";
import {
	type AttributeData,
	AttributesManager,
} from "../../../../../../modules/marketplace/components/AttributesManager";
import {
	type SimpleCategorySelection,
	SimpleCategorySelector,
} from "../../../../../../modules/marketplace/components/SimpleCategorySelector";
import { ISRAELI_CITIES } from "../../../../../../modules/marketplace/constants/cities";

interface FormState {
	categories: Array<{
		slug: string;
		name: string;
		documentId: string;
		level: number;
	}>;
	title: string;
	description: string;
	address: string;
	type: "rent" | "sale" | "free";
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

export default function DetailsStep({
	formState,
	updateField,
	onNext,
}: DetailsStepProps) {
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [citySearchTerm, setCitySearchTerm] = useState("");

	// Handle category selection changes
	const handleCategoryChange = useCallback(
		(selection: SimpleCategorySelection) => {
			// Build categories array from selection
			const categories = [];

			if (selection.primary) {
				categories.push({
					slug: selection.primary.slug,
					name: selection.primary.name,
					documentId: selection.primary.documentId,
					level: 0,
				});

				// Automatically set listing type to "rent" for apartments category
				const isApartments =
					selection.primary.slug.toLowerCase() === "apartment" ||
					selection.primary.slug.toLowerCase() === "apartments" ||
					selection.primary.slug.toLowerCase() === "real-estate" ||
					selection.primary.name.toLowerCase().includes("apartment");

				if (isApartments && formState.type !== "rent") {
					updateField("type", "rent");
				}
			}

			if (selection.subcategory) {
				categories.push({
					slug: selection.subcategory.slug,
					name: selection.subcategory.name,
					documentId: selection.subcategory.documentId,
					level: 1,
				});
			}

			updateField("categories", categories);
		},
		[updateField, formState.type],
	);

	// Handle attribute updates
	const handleUpdateAttributes = useCallback(
		(attributes: AttributeData[]) => {
			updateField("attributes", attributes);
		},
		[updateField],
	);

	// Handle city selection
	const handleCityChange = useCallback(
		(selectedValue: string) => {
			updateField("address", selectedValue);
			setCitySearchTerm(""); // Clear search when selection is made
		},
		[updateField],
	);

	// Filter cities based on search term
	const filteredCities = ISRAELI_CITIES.filter((city: string) =>
		city.toLowerCase().includes(citySearchTerm.toLowerCase()),
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

		if (!formState.address) {
			newErrors.address = "City is required";
		}

		if (!formState.type) {
			newErrors.type = "Listing type is required";
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

	// Convert the attributes array to a record for the AttributesManager
	const attributeValues =
		formState.attributes?.reduce(
			(acc, attr) => {
				acc[attr.attributeDocumentId] = attr.value;
				return acc;
			},
			{} as Record<string, string>,
		) || {};

	// Check if the selected category is apartments (should be rent-only)
	const isApartmentsCategory = formState.categories?.some((cat) => {
		const slug = cat.slug.toLowerCase();
		const name = cat.name.toLowerCase();
		return (
			slug === "apartment" ||
			slug === "apartments" ||
			slug === "real-estate" ||
			name.includes("apartment")
		);
	});

	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<h2 className="text-2xl font-bold">Listing Details</h2>
				<p className="text-muted-foreground">
					Provide basic information about your listing.
				</p>
			</div>

			{/* Category Selection */}
			<div>
				<SimpleCategorySelector
					initialPrimarySlug={formState.categories?.[0]?.slug || null}
					initialSubcategorySlug={
						formState.categories?.[1]?.slug || null
					}
					allowSelectAll={false}
					labels={{
						primary: "Main Category",
						subcategory: "Subcategory",
					}}
					placeholders={{
						primary: "Select a category",
						subcategory: "Select a subcategory",
					}}
					onChange={handleCategoryChange}
				/>
				{errors.category && (
					<p className="text-sm text-destructive mt-1">
						{errors.category}
					</p>
				)}
			</div>

			{/* Listing Type */}
			<div className="space-y-2">
				<Label htmlFor="type">
					Listing Type
					{isApartmentsCategory && (
						<span className="text-sm text-muted-foreground ml-2">
							(Apartments are always for rent)
						</span>
					)}
				</Label>
				<Select
					value={
						isApartmentsCategory ? "rent" : formState.type || "sale"
					}
					onValueChange={(value) => updateField("type", value)}
					disabled={isApartmentsCategory}
				>
					<SelectTrigger disabled={isApartmentsCategory}>
						<SelectValue placeholder="Select listing type" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="sale">For Sale</SelectItem>
						<SelectItem value="rent">For Rent</SelectItem>
						<SelectItem value="free">Free</SelectItem>
					</SelectContent>
				</Select>
				{errors.type && (
					<p className="text-sm text-destructive">{errors.type}</p>
				)}
			</div>

			{/* Address */}
			<div className="space-y-2">
				<Label htmlFor="address">Which city is the listing in?</Label>
				<Select
					value={formState.address || ""}
					onValueChange={handleCityChange}
				>
					<SelectTrigger>
						<SelectValue placeholder="Select a city" />
					</SelectTrigger>
					<SelectContent className="max-h-[200px] overflow-y-auto">
						{/* Search input */}
						<div className="p-2 border-b">
							<input
								type="text"
								placeholder="Search cities..."
								value={citySearchTerm}
								onChange={(e) =>
									setCitySearchTerm(e.target.value)
								}
								className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-primary"
								onClick={(e) => e.stopPropagation()} // Prevent dropdown from closing
							/>
						</div>

						{filteredCities.length > 0 ? (
							filteredCities.map((city) => (
								<SelectItem key={city} value={city}>
									{city}
								</SelectItem>
							))
						) : (
							<div className="p-2 text-sm text-muted-foreground text-center">
								No cities found
							</div>
						)}
					</SelectContent>
				</Select>
				{errors.address && (
					<p className="text-sm text-destructive">{errors.address}</p>
				)}
			</div>

			<div className="space-y-2">
				<Label htmlFor="title">Title</Label>
				<Input
					id="title"
					placeholder="Enter a descriptive title"
					value={formState.title || ""}
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
					value={formState.description || ""}
					onChange={(e) => updateField("description", e.target.value)}
				/>
				{errors.description && (
					<p className="text-sm text-destructive">
						{errors.description}
					</p>
				)}
			</div>

			{/* Dynamic Attributes */}
			{formState.categories && formState.categories.length > 0 && (
				<AttributesManager
					selectedCategories={formState.categories}
					values={attributeValues}
					isFilter={false}
					errors={errors}
					onUpdateAttributes={handleUpdateAttributes}
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
