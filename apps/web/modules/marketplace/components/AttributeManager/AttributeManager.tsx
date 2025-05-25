/**
 * Attribute Manager Component
 * Clean component for managing attributes using the new architecture
 */

"use client";

import { Skeleton } from "@ui/components/skeleton";
import { useEffect, useState } from "react";
import { useCategoryAttributes } from "../../data/category-hooks";
import {
	type AttributeDefinition,
	type AttributeState,
	type AttributeValue,
	attributeStatesToFormData,
	getAttributeErrors,
	initializeAttributeStates,
	updateAttributeState,
} from "../../lib/attribute-utils";
import { useCategorySelectionState } from "../../state/category-context";
import { AttributeField } from "./AttributeField";

interface AttributeManagerProps {
	/**
	 * Initial attribute values
	 */
	initialValues?: Record<string, AttributeValue>;

	/**
	 * Whether this is used for filtering (true) or form input (false)
	 */
	isFilter?: boolean;

	/**
	 * Additional category slugs to fetch attributes for
	 */
	additionalCategorySlugs?: string[];

	/**
	 * Callback when attribute values change
	 */
	onChange?: (
		attributeDocumentId: string,
		attributeName: string,
		value: AttributeValue,
	) => void;

	/**
	 * Callback for batch attribute updates (form use)
	 */
	onBatchUpdate?: (
		attributes: Array<{
			attributeDocumentId: string;
			attributeName: string;
			value: AttributeValue;
		}>,
	) => void;

	/**
	 * External validation errors
	 */
	externalErrors?: Record<string, string>;

	/**
	 * CSS classes
	 */
	className?: string;
}

export function AttributeManager({
	initialValues = {},
	isFilter = false,
	additionalCategorySlugs = [],
	onChange,
	onBatchUpdate,
	externalErrors = {},
	className = "",
}: AttributeManagerProps) {
	const categoryState = useCategorySelectionState();

	// Combine category slugs from selection and additional ones
	const categorySlugs = [
		...categoryState.selection.path.map((cat) => cat.slug),
		...additionalCategorySlugs,
	].filter(Boolean);

	// Fetch attributes for selected categories
	const {
		data: categoryAttributes,
		isLoading,
		error,
	} = useCategoryAttributes(categorySlugs, {
		enabled: categorySlugs.length > 0,
	});

	// Transform and manage attribute states
	const [attributeStates, setAttributeStates] = useState<AttributeState[]>(
		[],
	);
	const [definitions, setDefinitions] = useState<AttributeDefinition[]>([]);

	// Update definitions when category attributes change
	useEffect(() => {
		if (categoryAttributes) {
			// Note: categoryAttributes is already in our format from the service
			setDefinitions(
				categoryAttributes.map((attr) => ({
					id: attr.id,
					documentId: attr.documentId,
					name: attr.name,
					type: attr.type as AttributeDefinition["type"],
					required: attr.required,
					options: attr.options,
					metadata: attr.metadata as AttributeDefinition["metadata"],
				})),
			);
		}
	}, [categoryAttributes]);

	// Initialize attribute states when definitions or initial values change
	useEffect(() => {
		if (definitions.length > 0) {
			const states = initializeAttributeStates(
				definitions,
				initialValues,
			);
			setAttributeStates(states);

			// For form use, trigger batch update
			if (!isFilter && onBatchUpdate) {
				onBatchUpdate(attributeStatesToFormData(states));
			}
		}
	}, [definitions, initialValues, isFilter, onBatchUpdate]);

	// Handle attribute value change
	const handleAttributeChange = (
		documentId: string,
		value: AttributeValue,
	) => {
		const newStates = updateAttributeState(
			attributeStates,
			documentId,
			value,
		);
		setAttributeStates(newStates);

		// Find the attribute definition for the name
		const definition = definitions.find(
			(def) => def.documentId === documentId,
		);
		if (!definition) return;

		// Call individual change callback
		if (onChange) {
			onChange(documentId, definition.name, value);
		}

		// For form use, trigger batch update
		if (!isFilter && onBatchUpdate) {
			onBatchUpdate(attributeStatesToFormData(newStates));
		}
	};

	// Get combined errors (validation + external)
	const validationErrors = getAttributeErrors(attributeStates);
	const allErrors = { ...validationErrors, ...externalErrors };

	// Show loading state
	if (isLoading && categorySlugs.length > 0) {
		return (
			<div className={`space-y-4 ${className}`}>
				{!isFilter && (
					<h3 className="text-sm font-medium">Additional Details</h3>
				)}
				<div className="space-y-3">
					{Array.from({ length: 3 }).map((_, index) => (
						<div key={index} className="space-y-1">
							<Skeleton className="h-4 w-24" />
							<Skeleton className="h-10 w-full" />
						</div>
					))}
				</div>
			</div>
		);
	}

	// Show error state
	if (error) {
		return (
			<div className={`space-y-4 ${className}`}>
				{!isFilter && (
					<h3 className="text-sm font-medium">Additional Details</h3>
				)}
				<div className="text-sm text-destructive">
					Failed to load attributes
				</div>
			</div>
		);
	}

	// Don't render if no categories selected or no attributes
	if (categorySlugs.length === 0 || attributeStates.length === 0) {
		return null;
	}

	return (
		<div className={`space-y-4 ${className}`}>
			{!isFilter && (
				<h3 className="text-sm font-medium">Additional Details</h3>
			)}

			<div className="space-y-4">
				{attributeStates.map((state) => {
					const error = allErrors[state.definition.documentId];

					return (
						<div
							key={state.definition.documentId}
							className="space-y-1"
						>
							<AttributeField
								definition={state.definition}
								value={state.value}
								onChange={(value: AttributeValue) =>
									handleAttributeChange(
										state.definition.documentId,
										value,
									)
								}
								error={error}
							/>
							{error && (
								<p className="text-sm text-destructive">
									{error}
								</p>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}
