"use client";

import { Input } from "@ui/components/input";
import { Label } from "@ui/components/label";
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
	label = "Price Range",
}: PriceRangeFilterProps) {
	// Track if this is the first render
	const isInitialMount = useRef(true);

	// Set state from props
	const [minValue, setMinValue] = useState<number>(initialRange[0]);
	const [maxValue, setMaxValue] = useState<number>(initialRange[1]);

	// Update local state when props change
	useEffect(() => {
		setMinValue(initialRange[0]);
		setMaxValue(initialRange[1]);
	}, [initialRange]);

	// Only call onChange when values actually change, and not on first render
	useEffect(() => {
		if (isInitialMount.current) {
			isInitialMount.current = false;
			return;
		}

		// Debounce the onChange call
		const timer = setTimeout(() => {
			onChange([minValue, maxValue]);
		}, 300);

		return () => clearTimeout(timer);
	}, [minValue, maxValue, onChange]);

	const handleMinChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const value =
				e.target.value === "" ? 0 : Number.parseInt(e.target.value);
			if (!Number.isNaN(value)) {
				// Ensure min doesn't exceed max and stays within bounds
				setMinValue(Math.max(minPrice, Math.min(value, maxValue)));
			}
		},
		[maxValue, minPrice],
	);

	const handleMaxChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const value =
				e.target.value === ""
					? maxPrice
					: Number.parseInt(e.target.value);
			if (!Number.isNaN(value)) {
				// Ensure max doesn't go below min and stays within bounds
				setMaxValue(Math.min(maxPrice, Math.max(value, minValue)));
			}
		},
		[minValue, maxPrice],
	);

	return (
		<div className="space-y-2">
			<Label className="text-sm font-medium">{label}</Label>
			<div className="flex items-center gap-3">
				<div className="flex-1">
					<div className="relative">
						<span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">
							{currency}
						</span>
						<Input
							id="price-min"
							type="number"
							placeholder="Min"
							className="pl-8 h-10"
							value={minValue || ""}
							onChange={handleMinChange}
							min={minPrice}
							max={maxPrice}
							aria-label="Minimum price"
						/>
					</div>
				</div>
				<span className="text-muted-foreground text-sm">to</span>
				<div className="flex-1">
					<div className="relative">
						<span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">
							{currency}
						</span>
						<Input
							id="price-max"
							type="number"
							placeholder="Max"
							className="pl-8 h-10"
							value={maxValue || ""}
							onChange={handleMaxChange}
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
