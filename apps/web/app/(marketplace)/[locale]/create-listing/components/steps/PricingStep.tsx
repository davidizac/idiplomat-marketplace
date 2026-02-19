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
import { useTranslations } from "next-intl";
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
	const t = useTranslations("marketplace.pricing");
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
				newErrors.price = t("invalidPrice");
			}
		} else if (formState.type === "rent") {
			if (!formState.rental_price || formState.rental_price <= 0) {
				newErrors.rental_price = t("invalidPrice");
			}
			if (!formState.rental_period) {
				newErrors.rental_period = t("selectRentalPeriodError");
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
					title: t("setYourPrice"),
					description: t("setYourPriceDesc"),
				};
			case "rent":
				return {
					title: t("setRentalPrice"),
					description: t("setRentalPriceDesc"),
				};
			case "free":
				return {
					title: t("freeListing"),
					description: t("freeListingDesc"),
				};
			default:
				return {
					title: t("pricingTitle"),
					description: t("pricingDesc"),
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
						<Label htmlFor="price">{t("priceLabel")}</Label>
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
								{t("rentalPriceLabel")}
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
							<Label htmlFor="rental_period">{t("rentalPeriod")}</Label>
							<Select
								value={formState.rental_period || ""}
								onValueChange={(value) =>
									updateField("rental_period", value)
								}
							>
								<SelectTrigger>
									<SelectValue placeholder={t("selectRentalPeriod")} />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="hourly">
										{t("perHour")}
									</SelectItem>
									<SelectItem value="daily">
										{t("perDay")}
									</SelectItem>
									<SelectItem value="weekly">
										{t("perWeek")}
									</SelectItem>
									<SelectItem value="monthly">
										{t("perMonth")}
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
						<h3 className="font-medium mb-2">{t("freeListing")}</h3>
						<p className="text-sm text-muted-foreground">
							{t("freeListingInfo")}
						</p>
					</div>
				)}

				{/* Pricing Tips */}
				{formState.type !== "free" && (
					<div className="bg-card p-4 border rounded-md">
						<h3 className="font-medium mb-2">{t("pricingTips")}</h3>
						<ul className="text-sm space-y-2 text-muted-foreground">
							<li>• {t("tip1")}</li>
							<li>• {t("tip2")}</li>
							<li>• {t("tip3")}</li>
							<li>• {t("tip4")}</li>
						</ul>
					</div>
				)}
			</div>

			<div className="flex justify-between">
				<Button type="button" variant="outline" onClick={onBack}>
					{t("back")}
				</Button>
				<Button type="button" onClick={handleNext}>
					{t("continueToPhotos")}
				</Button>
			</div>
		</div>
	);
}
