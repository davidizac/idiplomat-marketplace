"use client";

import { Input } from "@ui/components/input";
import { Label } from "@ui/components/label";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";

interface PriceRangeFilterProps {
	onChange: (range: [number, number]) => void;
	initialRange: [number, number];
	maxPrice?: number;
	minPrice?: number;
	currency?: string;
	label?: string;
}

export function PriceRangeFilter({
	onChange,
	initialRange = [0, 10000],
	maxPrice = 10000,
	minPrice = 0,
	currency = "₪",
	label,
}: PriceRangeFilterProps) {
	const t = useTranslations("marketplace.filters");
	const resolvedLabel = label ?? t("priceRange");
	// Track if this is the first render
	const isInitialMount = useRef(true);
	// Keep the ref updated with the latest callback to avoid dependency issues
	const onChangeRef = useRef(onChange);

	// Store the last committed values to detect external changes
	const lastCommittedRef = useRef<[number, number]>(initialRange);

	// Store input values as strings to allow partial input
	const [minInput, setMinInput] = useState<string>(String(initialRange[0]));
	const [maxInput, setMaxInput] = useState<string>(String(initialRange[1]));

	// Keep the ref updated
	useEffect(() => {
		onChangeRef.current = onChange;
	}, [onChange]);

	// Only update local state when initialRange changes from an external source
	// (not from our own onChange callback)
	useEffect(() => {
		const [newMin, newMax] = initialRange;
		const [lastMin, lastMax] = lastCommittedRef.current;

		// Only update if the values have changed externally
		if (newMin !== lastMin || newMax !== lastMax) {
			setMinInput(String(newMin));
			setMaxInput(String(newMax));
			lastCommittedRef.current = initialRange;
		}
	}, [initialRange]);

	// Debounced onChange effect
	useEffect(() => {
		if (isInitialMount.current) {
			isInitialMount.current = false;
			return;
		}

		// Parse the current input values
		const minValue = minInput === "" ? minPrice : Number.parseInt(minInput);
		const maxValue = maxInput === "" ? maxPrice : Number.parseInt(maxInput);

		// Only call onChange if both values are valid numbers
		if (!Number.isNaN(minValue) && !Number.isNaN(maxValue)) {
			// Debounce the onChange call
			const timer = setTimeout(() => {
				// Constrain values before sending
				const constrainedMin = Math.max(
					minPrice,
					Math.min(minValue, maxValue),
				);
				const constrainedMax = Math.min(
					maxPrice,
					Math.max(maxValue, minValue),
				);

				// Update the last committed values
				lastCommittedRef.current = [constrainedMin, constrainedMax];

				onChangeRef.current([constrainedMin, constrainedMax]);
			}, 500);

			return () => clearTimeout(timer);
		}
	}, [minInput, maxInput, minPrice, maxPrice]);

	const handleMinChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const value = e.target.value;
			// Allow empty string or valid number input
			if (value === "" || /^\d+$/.test(value)) {
				setMinInput(value);
			}
		},
		[],
	);

	const handleMaxChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const value = e.target.value;
			// Allow empty string or valid number input
			if (value === "" || /^\d+$/.test(value)) {
				setMaxInput(value);
			}
		},
		[],
	);

	const handleMinBlur = useCallback(() => {
		// On blur, ensure we have a valid value
		const value = minInput === "" ? minPrice : Number.parseInt(minInput);
		if (!Number.isNaN(value)) {
			const constrainedValue = Math.max(
				minPrice,
				Math.min(value, Number.parseInt(maxInput) || maxPrice),
			);
			setMinInput(String(constrainedValue));
		} else {
			setMinInput(String(minPrice));
		}
	}, [minInput, maxInput, minPrice, maxPrice]);

	const handleMaxBlur = useCallback(() => {
		// On blur, ensure we have a valid value
		const value = maxInput === "" ? maxPrice : Number.parseInt(maxInput);
		if (!Number.isNaN(value)) {
			const constrainedValue = Math.min(
				maxPrice,
				Math.max(value, Number.parseInt(minInput) || minPrice),
			);
			setMaxInput(String(constrainedValue));
		} else {
			setMaxInput(String(maxPrice));
		}
	}, [minInput, maxInput, minPrice, maxPrice]);

	return (
		<div className="space-y-2">
			<Label className="text-sm font-medium">{resolvedLabel}</Label>
			<div className="flex items-center gap-3">
				<div className="flex-1">
					<div className="relative">
						<span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">
							{currency}
						</span>
						<Input
							id="price-min"
							type="number"
							placeholder={t("min")}
							className="pl-8 h-10"
							value={minInput}
							onChange={handleMinChange}
							onBlur={handleMinBlur}
							min={minPrice}
							max={maxPrice}
							aria-label="Minimum price"
						/>
					</div>
				</div>
				<span className="text-muted-foreground text-sm">{t("to")}</span>
				<div className="flex-1">
					<div className="relative">
						<span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">
							{currency}
						</span>
						<Input
							id="price-max"
							type="number"
							placeholder={t("max")}
							className="pl-8 h-10"
							value={maxInput}
							onChange={handleMaxChange}
							onBlur={handleMaxBlur}
							min={minPrice}
							max={maxPrice}
							aria-label="Maximum price"
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
