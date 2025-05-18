"use client";

import { Button } from "@ui/components/button";
import { Input } from "@ui/components/input";
import { Label } from "@ui/components/label";
import { useState } from "react";

interface FormState {
	price: number;
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
	const [error, setError] = useState<string>("");

	// Handle price change
	const handlePriceChange = (value: string) => {
		// Strip out non-numeric characters
		const numericValue = value.replace(/[^0-9.]/g, "");

		// Allow only valid numeric values
		const parsed = Number.parseFloat(numericValue);
		if (numericValue === "" || !Number.isNaN(parsed)) {
			updateField("price", numericValue === "" ? 0 : parsed);
		}
	};

	// Validate price before proceeding
	const validatePrice = () => {
		if (!formState.price || formState.price <= 0) {
			setError("Please enter a valid price greater than zero");
			return false;
		}

		setError("");
		return true;
	};

	// Handle next button click
	const handleNext = () => {
		if (validatePrice()) {
			onNext();
		}
	};

	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<h2 className="text-2xl font-bold">Pricing</h2>
				<p className="text-muted-foreground">
					Set a competitive price for your listing.
				</p>
			</div>

			<div className="bg-muted/30 p-6 rounded-lg space-y-6 max-w-md mx-auto">
				<div className="space-y-2">
					<Label htmlFor="price">Price ($)</Label>
					<div className="relative">
						<span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
							$
						</span>
						<Input
							id="price"
							type="text"
							inputMode="decimal"
							className="pl-8"
							value={formState.price === 0 ? "" : formState.price}
							onChange={(e) => handlePriceChange(e.target.value)}
							placeholder="0.00"
						/>
					</div>
					{error && (
						<p className="text-sm text-destructive">{error}</p>
					)}
				</div>

				<div className="bg-card p-4 border rounded-md">
					<h3 className="font-medium mb-2">Pricing tips</h3>
					<ul className="text-sm space-y-2 text-muted-foreground">
						<li>
							• Check similar listings for competitive pricing
						</li>
						<li>• Consider the condition of your item</li>
						<li>• Factor in any extras you're including</li>
						<li>
							• Diplomatic community members often look for good
							deals
						</li>
					</ul>
				</div>
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
