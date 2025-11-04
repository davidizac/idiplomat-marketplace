"use client";

import { categoryService } from "@repo/cms";
import type { Attribute } from "@repo/cms";
import { useEffect, useState } from "react";
import {
	AttributeFilter,
	type AttributeValue,
} from "../listings/components/filters/AttributeFilter";

export interface AttributeData {
	attributeDocumentId: string;
	attributeName: string;
	value: AttributeValue;
}

export interface AttributesManagerProps {
	/**
	 * Selected categories to display attributes for
	 */
	selectedCategories: Array<{
		documentId: string;
		slug: string;
		name: string;
		level: number;
	}>;

	/**
	 * Current attribute values
	 */
	values?: Record<string, AttributeValue>;

	/**
	 * Whether this is being used for filtering (true) or form input (false)
	 */
	isFilter?: boolean;

	/**
	 * Any validation errors to display (for form use)
	 */
	errors?: Record<string, string>;

	/**
	 * CSS classes to apply to the component
	 */
	className?: string;

	/**
	 * Callback when an attribute value changes
	 */
	onChange?: (
		attributeDocumentId: string,
		attributeName: string,
		value: AttributeValue,
	) => void;

	/**
	 * Callback to update all attributes at once (for form use)
	 */
	onUpdateAttributes?: (attributes: Array<AttributeData>) => void;

	/**
	 * Function to get the current value of an attribute (for filter use)
	 */
	getAttributeValue?: (attributeDocumentId: string) => AttributeValue;
}

// Interface to group attributes by category
interface AttributeGroup {
	categoryName: string;
	categoryLevel: number;
	attributes: Attribute[];
}

export function AttributesManager({
	selectedCategories,
	values = {},
	isFilter = false,
	errors = {},
	className = "",
	onChange,
	onUpdateAttributes,
	getAttributeValue,
}: AttributesManagerProps) {
	// State to store grouped attributes from selected categories
	const [attributeGroups, setAttributeGroups] = useState<AttributeGroup[]>([]);
	// State to track if we're loading attributes
	const [isLoading, setIsLoading] = useState(false);
	// State to store attribute values for form use
	const [attributeValues, setAttributeValues] = useState<AttributeData[]>([]);

	// Fetch and group attributes from all selected categories
	useEffect(() => {
		const fetchCategoryAttributes = async () => {
			if (!selectedCategories.length) {
				setAttributeGroups([]);
				return;
			}

			setIsLoading(true);

			try {
				const groups: AttributeGroup[] = [];
				const seenAttributeIds = new Set<string>();

				// Fetch each category's attributes and group them
				for (const category of selectedCategories) {
					const categoryDetails =
						await categoryService.getCategoryBySlug(category.slug);

					if (
						categoryDetails.attributes &&
						Array.isArray(categoryDetails.attributes) &&
						categoryDetails.attributes.length > 0
					) {
						// Filter out attributes we've already seen to avoid duplicates
						const uniqueAttributes = categoryDetails.attributes.filter(
							(attr) => {
								if (seenAttributeIds.has(attr.documentId)) {
									return false;
								}
								seenAttributeIds.add(attr.documentId);
								return true;
							}
						);

						// Only create a group if there are unique attributes
						if (uniqueAttributes.length > 0) {
							groups.push({
								categoryName: category.name,
								categoryLevel: category.level,
								attributes: uniqueAttributes,
							});
						}
					}
				}

				setAttributeGroups(groups);
			} catch (error) {
				console.error("Error fetching category attributes:", error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchCategoryAttributes();
	}, [selectedCategories]);

	// Initialize attribute values for form use while avoiding unnecessary state churn
	useEffect(() => {
		if (isFilter) {
			return;
		}

		// Flatten all attributes from all groups
		const allAttributes = attributeGroups.flatMap((group) => group.attributes);

		if (allAttributes.length === 0) {
			return;
		}

		const newAttributeValues = allAttributes.map((attr) => {
			const existingValue = attributeValues.find(
				(av) => av.attributeDocumentId === attr.documentId,
			);

			if (existingValue) {
				return existingValue;
			}

			const value =
				values[attr.documentId] !== undefined
					? values[attr.documentId]
					: getDefaultValue(attr.type);

			return {
				attributeDocumentId: attr.documentId,
				attributeName: attr.name,
				value,
			};
		});

		// Detect real changes by shallow-comparing the arrays
		const hasChanges =
			newAttributeValues.length !== attributeValues.length ||
			newAttributeValues.some((newAttr, idx) => {
				const current = attributeValues[idx];
				return (
					!current ||
					current.attributeDocumentId !==
						newAttr.attributeDocumentId ||
					current.value !== newAttr.value
				);
			});

		if (!hasChanges) {
			return;
		}

		setAttributeValues(newAttributeValues);

		// Use a timeout to avoid calling the callback during render
		const timeoutId = setTimeout(() => {
			if (onUpdateAttributes) {
				onUpdateAttributes(newAttributeValues);
			}
		}, 0);

		return () => clearTimeout(timeoutId);
		// We intentionally omit onUpdateAttributes to avoid cycles when the parent updates
		// as a result of the callback that is triggered here.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [attributeGroups, values, isFilter]);

	// Helper to get default value based on attribute type
	const getDefaultValue = (type: string): AttributeValue => {
		switch (type) {
			case "text":
			case "select":
				return "";
			case "number":
				return 0;
			case "boolean":
				return false;
			case "date":
				return null;
			case "multi-select":
				return [];
			default:
				return null;
		}
	};

	// Handle attribute value change for form use
	const handleAttributeChange = (
		attributeDocumentId: string,
		value: AttributeValue,
	) => {
		if (isFilter) {
			// For filter use, call the onChange callback directly
			// Find attribute in any of the groups
			let attribute: Attribute | undefined;
			for (const group of attributeGroups) {
				attribute = group.attributes.find(
					(attr) => attr.documentId === attributeDocumentId,
				);
				if (attribute) break;
			}
			
			if (attribute && onChange) {
				onChange(attributeDocumentId, attribute.name, value);
			}
		} else {
			// For form use, update the internal state
			const newValues = attributeValues.map((attr) =>
				attr.attributeDocumentId === attributeDocumentId
					? { ...attr, value }
					: attr,
			);

			setAttributeValues(newValues);

			// If we have an update callback, call it with the updated values
			if (onUpdateAttributes) {
				onUpdateAttributes(newValues);
			}
		}
	};

	// Get attribute value - either from form state or from the filter manager
	const getValue = (attributeDocumentId: string): AttributeValue => {
		if (isFilter) {
			// For filter use, use the provided getter function
			return getAttributeValue
				? getAttributeValue(attributeDocumentId)
				: null;
		}

		// For form use, get from the internal state
		const attr = attributeValues.find(
			(a) => a.attributeDocumentId === attributeDocumentId,
		);
		return attr ? attr.value : null;
	};

	// If no attribute groups or no categories selected, don't render anything
	if (attributeGroups.length === 0 || selectedCategories.length === 0) {
		return null;
	}

	return (
		<div className={`space-y-6 ${className}`}>
			{isLoading ? (
				<div className="animate-pulse space-y-4">
					<div className="h-4 bg-gray-200 rounded w-1/4" />
					<div className="h-10 bg-gray-200 rounded" />
					<div className="h-10 bg-gray-200 rounded" />
				</div>
			) : (
				<div className="space-y-6">
					{!isFilter && (
						<h3 className="text-sm font-medium">
							Additional Details
						</h3>
					)}

					{attributeGroups.map((group, groupIndex) => (
						<div key={groupIndex} className="space-y-4">
							{/* Category header - only show if there are multiple groups or if it's a subcategory */}
							{(attributeGroups.length > 1 || group.categoryLevel > 0) && (
								<div className="border-b pb-2">
									<h4 className={`font-medium ${
										group.categoryLevel === 0 
											? "text-base" 
											: "text-sm text-muted-foreground"
									}`}>
										{group.categoryName}
									</h4>
								</div>
							)}

							{/* Attributes for this category */}
							<div className="space-y-4">
								{group.attributes.map((attribute) => (
									<div
										key={attribute.documentId}
										className="space-y-1"
									>
										<AttributeFilter
											attribute={attribute}
											value={getValue(attribute.documentId)}
											onChange={(
												attributeDocumentId,
												value,
											) =>
												handleAttributeChange(
													attributeDocumentId,
													value,
												)
											}
										/>
										{!isFilter &&
											errors[`attribute-${attribute.id}`] && (
												<p className="text-sm text-destructive">
													{
														errors[
															`attribute-${attribute.id}`
														]
													}
												</p>
											)}
									</div>
								))}
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
