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
import { useState } from "react";

interface FormState {
	type: "rent" | "sale" | "free";
	price?: number;
	rental_price?: number;
	rental_period?: "hourly" | "daily" | "weekly" | "monthly";
	[key: string]: any;
}

interface PricingStepProps {
	formState: FormState;
	updateField: (field: string, value: any) => void;
	onNext: () => void;
	onBack: () => void;
}

export default function PricingStep({
	formState,
	updateField,
	onNext,
	onBack,
}: PricingStepProps) {
	const [errors, setErrors] = useState<Record<string, string>>({});

	// Handle price change for sale items
	const handlePriceChange = (value: string) => {
		// Strip out non-numeric characters
		const numericValue = value.replace(/[^0-9.]/g, "");

		// Allow only valid numeric values
		const parsed = Number.parseFloat(numericValue);
		if (numericValue === "" || !Number.isNaN(parsed)) {
			updateField("price", numericValue === "" ? 0 : parsed);
		}
	};

	// Handle rental price change
	const handleRentalPriceChange = (value: string) => {
		// Strip out non-numeric characters
		const numericValue = value.replace(/[^0-9.]/g, "");

		// Allow only valid numeric values
		const parsed = Number.parseFloat(numericValue);
		if (numericValue === "" || !Number.isNaN(parsed)) {
			updateField("rental_price", numericValue === "" ? 0 : parsed);
		}
	};

	// Validate form before proceeding
	const validateForm = () => {
		const newErrors: Record<string, string> = {};

		if (formState.type === "sale") {
			if (!formState.price || formState.price <= 0) {
				newErrors.price =
					"Please enter a valid price greater than zero";
			}
		} else if (formState.type === "rent") {
			if (!formState.rental_price || formState.rental_price <= 0) {
				newErrors.rental_price =
					"Please enter a valid rental price greater than zero";
			}
			if (!formState.rental_period) {
				newErrors.rental_period = "Please select a rental period";
			}
		}
		// No validation needed for "free" type

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	// Handle next button click
	const handleNext = () => {
		console.log("Attempting to move to next step...");
		const isValid = validateForm();
		console.log("Form validation result:", isValid);
		console.log("Current form state:", formState);

		if (isValid) {
			console.log("Calling onNext()...");
			onNext();
		}
	};

	// Get the title and description based on listing type
	const getTitleAndDescription = () => {
		switch (formState.type) {
			case "sale":
				return {
					title: "Set Your Price",
					description: "Set a competitive price for your listing.",
				};
			case "rent":
				return {
					title: "Set Your Rental Price",
					description:
						"Set a competitive rental price and period for your listing.",
				};
			case "free":
				return {
					title: "Free Listing",
					description:
						"This item will be listed as free. No pricing required.",
				};
			default:
				return {
					title: "Pricing",
					description: "Set pricing information for your listing.",
				};
		}
	};

	const { title, description } = getTitleAndDescription();

	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<h2 className="text-2xl font-bold">{title}</h2>
				<p className="text-muted-foreground">{description}</p>
			</div>

			<div className="bg-muted/30 p-6 rounded-lg space-y-6 max-w-md mx-auto">
				{/* Sale Price Input */}
				{formState.type === "sale" && (
					<div className="space-y-2">
						<Label htmlFor="price">Price (₪)</Label>
						<div className="relative">
							<span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
								₪
							</span>
							<Input
								id="price"
								type="text"
								inputMode="decimal"
								className="pl-8"
								value={
									formState.price === 0
										? ""
										: formState.price || ""
								}
								onChange={(e) =>
									handlePriceChange(e.target.value)
								}
								placeholder="0.00"
							/>
						</div>
						{errors.price && (
							<p className="text-sm text-destructive">
								{errors.price}
							</p>
						)}
					</div>
				)}

				{/* Rental Price Inputs */}
				{formState.type === "rent" && (
					<>
						<div className="space-y-2">
							<Label htmlFor="rental_price">
								Rental Price (₪)
							</Label>
							<div className="relative">
								<span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
									₪
								</span>
								<Input
									id="rental_price"
									type="text"
									inputMode="decimal"
									className="pl-8"
									value={
										formState.rental_price === 0
											? ""
											: formState.rental_price || ""
									}
									onChange={(e) =>
										handleRentalPriceChange(e.target.value)
									}
									placeholder="0.00"
								/>
							</div>
							{errors.rental_price && (
								<p className="text-sm text-destructive">
									{errors.rental_price}
								</p>
							)}
						</div>

						<div className="space-y-2">
							<Label htmlFor="rental_period">Rental Period</Label>
							<Select
								value={formState.rental_period || ""}
								onValueChange={(value) =>
									updateField("rental_period", value)
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select rental period" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="hourly">
										Per Hour
									</SelectItem>
									<SelectItem value="daily">
										Per Day
									</SelectItem>
									<SelectItem value="weekly">
										Per Week
									</SelectItem>
									<SelectItem value="monthly">
										Per Month
									</SelectItem>
								</SelectContent>
							</Select>
							{errors.rental_period && (
								<p className="text-sm text-destructive">
									{errors.rental_period}
								</p>
							)}
						</div>
					</>
				)}

				{/* Free Listing Message */}
				{formState.type === "free" && (
					<div className="bg-card p-4 border rounded-md text-center">
						<h3 className="font-medium mb-2">Free Listing</h3>
						<p className="text-sm text-muted-foreground">
							This item will be listed as free for other community
							members.
						</p>
					</div>
				)}

				{/* Pricing Tips */}
				{formState.type !== "free" && (
					<div className="bg-card p-4 border rounded-md">
						<h3 className="font-medium mb-2">Pricing tips</h3>
						<ul className="text-sm space-y-2 text-muted-foreground">
							<li>
								• Check similar listings for competitive pricing
							</li>
							<li>• Consider the condition of your item</li>
							<li>• Factor in any extras you're including</li>
							<li>
								• Diplomatic community members often look for
								good deals
							</li>
						</ul>
					</div>
				)}
			</div>

			<div className="flex justify-between">
				<Button type="button" variant="outline" onClick={onBack}>
					Back to Details
				</Button>
				<Button type="button" onClick={handleNext}>
					Continue to Photos
				</Button>
			</div>
		</div>
	);
}
