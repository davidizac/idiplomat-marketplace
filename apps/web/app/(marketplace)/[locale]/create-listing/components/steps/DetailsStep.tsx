"use client";
import type {} from "@repo/cms";
import { Button } from "@ui/components/button";
import { Input } from "@ui/components/input";
import { Label } from "@ui/components/label";
import { Textarea } from "@ui/components/textarea";
import { useCallback, useEffect, useState } from "react";
import {
	type AttributeData,
	AttributesManager,
} from "../../../../../../modules/marketplace/components/AttributesManager";
import {
	type CategorySelectionData,
	CategorySelector,
} from "../../../../../../modules/marketplace/components/CategorySelector";

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

export default function DetailsStep({
	formState,
	updateField,
	onNext,
}: DetailsStepProps) {
	const [errors, setErrors] = useState<Record<string, string>>({});

	// Initialize form state with empty categories array if it doesn't exist
	useEffect(() => {
		if (!formState.categories) {
			updateField("categories", []);
		}

		// Initialize attributes array if it doesn't exist
		if (!formState.attributes) {
			updateField("attributes", []);
		}
	}, [formState, updateField]);

	// Handle category selection changes
	const handleSelectionChange = useCallback(
		(data: CategorySelectionData) => {
			// Update the form state with the selected categories
			updateField("categories", data.selectedCategories);
		},
		[updateField],
	);

	// Handle attribute updates
	const handleUpdateAttributes = useCallback(
		(attributes: AttributeData[]) => {
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
	const attributeValues = formState.attributes?.reduce(
		(acc, attr) => {
			acc[attr.attributeDocumentId] = attr.value;
			return acc;
		},
		{} as Record<string, string>,
	);

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
				<CategorySelector
					label=""
					allowSelectAll={false}
					showSelectionPath={true}
					initialSelection={formState.categories}
					levelLabels={{
						root: "Main Category",
						subcategory: "Subcategories",
					}}
					placeholders={{
						root: "Select a category",
						subcategory: "Select a subcategory",
					}}
					onSelectionChange={handleSelectionChange}
				/>
				{errors.category && (
					<p className="text-sm text-destructive mt-1">
						{errors.category}
					</p>
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
