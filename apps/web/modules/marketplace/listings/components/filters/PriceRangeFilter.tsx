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
			const value = e.target.value === "" ? 0 : Number.parseInt(e.target.value);
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
				e.target.value === "" ? maxPrice : Number.parseInt(e.target.value);
			if (!Number.isNaN(value)) {
				// Ensure max doesn't go below min and stays within bounds
				setMaxValue(Math.min(maxPrice, Math.max(value, minValue)));
			}
		},
		[minValue, maxPrice],
	);

	// Calculate percentage for visual bar
	const getPercentage = (value: number) => {
		return ((value - minPrice) / (maxPrice - minPrice)) * 100;
	};

	// Format number with commas
	const formatPrice = (value: number) => {
		return value.toLocaleString();
	};

	return (
		<div className="space-y-4">
			<div className="space-y-2">
				<Label>{label}</Label>
				{/* Visual range slider */}
				<div className="h-2 relative bg-secondary rounded-full overflow-hidden">
					<div
						className="absolute h-full bg-primary rounded-full transition-all"
						style={{
							left: `${getPercentage(minValue)}%`,
							right: `${100 - getPercentage(maxValue)}%`,
						}}
					/>
				</div>
				{/* Price display */}
				<div className="flex items-center justify-between text-sm text-muted-foreground">
					<span>
						{currency}
						{formatPrice(minValue)}
					</span>
					<span>
						{currency}
						{formatPrice(maxValue)}
					</span>
				</div>
			</div>

			{/* Input fields */}
			<div className="grid grid-cols-2 gap-3">
				<div className="space-y-2">
					<Label htmlFor="price-min" className="text-xs">
						Min Price
					</Label>
					<div className="relative">
						<span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
							{currency}
						</span>
						<Input
							id="price-min"
							type="number"
							placeholder="0"
							className="pl-8"
							value={minValue}
							onChange={handleMinChange}
							min={minPrice}
							max={maxPrice}
							aria-label="Minimum price"
						/>
					</div>
				</div>
				<div className="space-y-2">
					<Label htmlFor="price-max" className="text-xs">
						Max Price
					</Label>
					<div className="relative">
						<span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
							{currency}
						</span>
						<Input
							id="price-max"
							type="number"
							placeholder={maxPrice.toString()}
							className="pl-8"
							value={maxValue}
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
