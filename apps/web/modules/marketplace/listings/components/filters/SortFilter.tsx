"use client";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@ui/components/select";
import { useEffect, useState } from "react";

export type SortOption = "newest" | "price-low-high" | "price-high-low";

interface SortFilterProps {
	onChange: (sort: SortOption) => void;
	selectedSort: SortOption;
}

const sortOptions = [
	{ id: "newest", name: "Newest First" },
	{ id: "price-low-high", name: "Price: Low to High" },
	{ id: "price-high-low", name: "Price: High to Low" },
];

export function SortFilter({ onChange, selectedSort }: SortFilterProps) {
	// Add local state to control the select
	const [value, setValue] = useState<SortOption>(selectedSort);

	// Only update when prop changes
	useEffect(() => {
		setValue(selectedSort);
	}, [selectedSort]);

	// Handle value change
	const handleValueChange = (newValue: string) => {
		const sortValue = newValue as SortOption;
		setValue(sortValue);
		onChange(sortValue);
	};

	return (
		<div className="w-full">
			<Select value={value} onValueChange={handleValueChange}>
				<SelectTrigger className="w-[200px]">
					<SelectValue placeholder="Sort by" />
				</SelectTrigger>
				<SelectContent>
					{sortOptions.map((option) => (
						<SelectItem key={option.id} value={option.id}>
							{option.name}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}
