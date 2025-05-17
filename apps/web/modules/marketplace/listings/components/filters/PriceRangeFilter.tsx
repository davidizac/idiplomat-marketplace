"use client";

import { Input } from "@ui/components/input";
import { useEffect, useRef, useState } from "react";

interface PriceRangeFilterProps {
	onChange: (range: [number, number]) => void;
	initialRange: [number, number];
	maxPrice: number;
}

export function PriceRangeFilter({
	onChange,
	initialRange = [0, 5000],
	maxPrice = 10000,
}: PriceRangeFilterProps) {
	// Track if this is the first render
	const isInitialMount = useRef(true);

	// Set state from props
	const [minPrice, setMinPrice] = useState<number>(initialRange[0]);
	const [maxPriceInput, setMaxPriceInput] = useState<number>(initialRange[1]);

	// Update local state when props change
	useEffect(() => {
		setMinPrice(initialRange[0]);
		setMaxPriceInput(initialRange[1]);
	}, [initialRange]);

	// Only call onChange when values actually change, and not on first render
	useEffect(() => {
		if (isInitialMount.current) {
			isInitialMount.current = false;
			return;
		}

		// Debounce the onChange call
		const timer = setTimeout(() => {
			onChange([minPrice, maxPriceInput]);
		}, 300);

		return () => clearTimeout(timer);
	}, [minPrice, maxPriceInput, onChange]);

	const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = Number.parseInt(e.target.value) || 0;
		setMinPrice(Math.min(value, maxPriceInput));
	};

	const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = Number.parseInt(e.target.value) || 0;
		setMaxPriceInput(Math.max(value, minPrice));
	};

	return (
		<div className="space-y-4">
			<h3 className="font-semibold">Price Range</h3>
			<div className="space-y-4">
				<div className="h-2 relative bg-secondary rounded-full">
					<div
						className="absolute h-full bg-primary rounded-full"
						style={{
							left: `${(minPrice / maxPrice) * 100}%`,
							right: `${100 - (maxPriceInput / maxPrice) * 100}%`,
						}}
					/>
				</div>
				<div className="flex items-center space-x-2">
					<Input
						type="number"
						placeholder="Min"
						className="w-24"
						value={minPrice}
						onChange={handleMinChange}
						min={0}
						max={maxPrice}
					/>
					<span>-</span>
					<Input
						type="number"
						placeholder="Max"
						className="w-24"
						value={maxPriceInput}
						onChange={handleMaxChange}
						min={0}
						max={maxPrice}
					/>
				</div>
			</div>
		</div>
	);
}
