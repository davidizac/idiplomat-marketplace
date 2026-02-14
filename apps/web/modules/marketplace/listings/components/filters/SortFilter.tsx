"use client";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@ui/components/select";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

export type SortOption = "newest" | "price-low-high" | "price-high-low";

interface SortFilterProps {
	onChange: (sort: SortOption) => void;
	selectedSort: SortOption;
}

const sortOptionKeys: Record<SortOption, string> = {
	newest: "newestFirst",
	"price-low-high": "priceLowHigh",
	"price-high-low": "priceHighLow",
};

export function SortFilter({ onChange, selectedSort }: SortFilterProps) {
	const t = useTranslations("marketplace.filters");
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
					<SelectValue placeholder={t("sortBy")} />
				</SelectTrigger>
				<SelectContent>
					{(Object.keys(sortOptionKeys) as SortOption[]).map((id) => (
						<SelectItem key={id} value={id}>
							{t(sortOptionKeys[id])}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}
