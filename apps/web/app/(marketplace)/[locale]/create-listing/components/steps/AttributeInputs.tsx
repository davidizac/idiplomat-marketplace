"use client";

import type { Attribute } from "@repo/cms";
import { Checkbox } from "@ui/components/checkbox";
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
import { useEffect, useRef } from "react";

interface AttributeInputsProps {
	attributes: Attribute[];
	values: Array<{
		attributeId: number;
		attributeName: string;
		value: string;
	}>;
	updateAttributes: (
		attributes: Array<{
			attributeId: number;
			attributeName: string;
			value: string;
		}>,
	) => void;
	errors?: Record<string, string>;
}

export default function AttributeInputs({
	attributes,
	values,
	updateAttributes,
	errors = {},
}: AttributeInputsProps) {
	// Keep track of whether we need to initialize attributes
	const initializedRef = useRef(false);

	// Initialize attributes with default values when they change
	useEffect(() => {
		// Skip if no attributes or if we've already initialized with these attributes
		if (
			attributes.length === 0 ||
			(values.length === attributes.length && initializedRef.current)
		) {
			return;
		}

		// Debug information in development
		if (process.env.NODE_ENV === "development") {
			console.log("AttributeInputs - attributes received:", attributes);
			console.log(
				"Attribute types:",
				attributes.map((a) => `${a.name}: ${a.type}`),
			);
		}

		// Calculate if we need to update the values
		const needsUpdate = attributes.some(
			(attr) => !values.some((val) => val.attributeId === attr.id),
		);

		if (needsUpdate) {
			const initializedAttributes = attributes.map((attr) => {
				// Check if we already have a value for this attribute
				const existingValue = values.find(
					(v) => v.attributeId === attr.id,
				);
				if (existingValue) return existingValue;

				// Otherwise create a new entry with default value
				let defaultValue = "";
				if (attr.type === "boolean") defaultValue = "false";
				else if (attr.type === "select" && attr.options.length > 0)
					defaultValue = attr.options[0];

				return {
					attributeId: attr.id,
					attributeName: attr.name,
					value: defaultValue,
				};
			});

			updateAttributes(initializedAttributes);
			initializedRef.current = true;
		}
	}, [attributes, values, updateAttributes]);

	if (attributes.length === 0) {
		return null;
	}

	const handleValueChange = (
		attributeId: number,
		attributeName: string,
		newValue: string,
	) => {
		const updatedValues = [...values];
		const index = updatedValues.findIndex(
			(v) => v.attributeId === attributeId,
		);

		if (index !== -1) {
			updatedValues[index] = { ...updatedValues[index], value: newValue };
		} else {
			updatedValues.push({ attributeId, attributeName, value: newValue });
		}

		updateAttributes(updatedValues);
	};

	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<h3 className="text-lg font-semibold">
					Category Specifications
				</h3>
				<p className="text-muted-foreground">
					Fill in the specifications for the selected category.
				</p>
			</div>

			<div className="space-y-4">
				{attributes.map((attr) => {
					const value =
						values.find((v) => v.attributeId === attr.id)?.value ||
						"";
					const errorKey = `attribute-${attr.id}`;
					const hasError = Boolean(errors[errorKey]);

					return (
						<div key={attr.id} className="space-y-2">
							<Label
								htmlFor={`attr-${attr.id}`}
								className={hasError ? "text-destructive" : ""}
							>
								{attr.name}
								{attr.required && (
									<span className="text-destructive ml-1">
										*
									</span>
								)}
								{process.env.NODE_ENV === "development" && (
									<span className="text-xs text-muted-foreground ml-2">
										(type: {attr.type})
									</span>
								)}
							</Label>

							{(attr.type === "text" ||
								attr.type === "string") && (
								<Input
									id={`attr-${attr.id}`}
									value={value}
									onChange={(e) =>
										handleValueChange(
											attr.id,
											attr.name,
											e.target.value,
										)
									}
									required={attr.required}
									className={
										hasError ? "border-destructive" : ""
									}
								/>
							)}

							{attr.type === "textarea" && (
								<Textarea
									id={`attr-${attr.id}`}
									value={value}
									onChange={(e) =>
										handleValueChange(
											attr.id,
											attr.name,
											e.target.value,
										)
									}
									required={attr.required}
									className={
										hasError ? "border-destructive" : ""
									}
								/>
							)}

							{attr.type === "select" && (
								<Select
									value={value}
									onValueChange={(val) =>
										handleValueChange(
											attr.id,
											attr.name,
											val,
										)
									}
								>
									<SelectTrigger
										id={`attr-${attr.id}`}
										className={
											hasError ? "border-destructive" : ""
										}
									>
										<SelectValue
											placeholder={`Select ${attr.name}`}
										/>
									</SelectTrigger>
									<SelectContent>
										{attr.options.map((option: string) => (
											<SelectItem
												key={option}
												value={option}
											>
												{option}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							)}

							{attr.type === "boolean" && (
								<div className="flex items-center space-x-2">
									<Checkbox
										id={`attr-${attr.id}`}
										checked={value === "true"}
										onCheckedChange={(checked) =>
											handleValueChange(
												attr.id,
												attr.name,
												checked ? "true" : "false",
											)
										}
									/>
									<label
										htmlFor={`attr-${attr.id}`}
										className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
									>
										Yes
									</label>
								</div>
							)}

							{attr.type === "number" && (
								<Input
									id={`attr-${attr.id}`}
									type="number"
									value={value}
									onChange={(e) =>
										handleValueChange(
											attr.id,
											attr.name,
											e.target.value,
										)
									}
									required={attr.required}
									className={
										hasError ? "border-destructive" : ""
									}
								/>
							)}

							{/* Fallback for any unrecognized attribute types */}
							{![
								"text",
								"string",
								"textarea",
								"select",
								"boolean",
								"number",
							].includes(attr.type) && (
								<div>
									<Input
										id={`attr-${attr.id}`}
										value={value}
										onChange={(e) =>
											handleValueChange(
												attr.id,
												attr.name,
												e.target.value,
											)
										}
										required={attr.required}
										className={
											hasError ? "border-destructive" : ""
										}
									/>
									{process.env.NODE_ENV === "development" && (
										<p className="text-xs text-muted-foreground mt-1">
											Unrecognized attribute type:{" "}
											{attr.type}
										</p>
									)}
								</div>
							)}

							{hasError && (
								<p className="text-sm text-destructive">
									{errors[errorKey]}
								</p>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}
