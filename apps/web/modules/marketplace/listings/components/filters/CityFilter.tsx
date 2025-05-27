"use client";

import { Label } from "@ui/components/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@ui/components/select";
import { useState } from "react";
import { ISRAELI_CITIES } from "../../../constants/cities";

interface CityFilterProps {
	value?: string | null;
	onChange: (city: string | null) => void;
	label?: string;
}

export function CityFilter({
	value = null,
	onChange,
	label = "City",
}: CityFilterProps) {
	const [searchTerm, setSearchTerm] = useState("");

	const handleValueChange = (selectedValue: string) => {
		if (selectedValue === "all") {
			onChange(null);
		} else {
			onChange(selectedValue);
		}
		setSearchTerm(""); // Clear search when selection is made
	};

	// Filter cities based on search term
	const filteredCities = ISRAELI_CITIES.filter((city: string) =>
		city.toLowerCase().includes(searchTerm.toLowerCase()),
	);

	return (
		<div className="space-y-2">
			<Label htmlFor="city-filter">{label}</Label>
			<Select value={value || "all"} onValueChange={handleValueChange}>
				<SelectTrigger id="city-filter">
					<SelectValue placeholder="Select a city" />
				</SelectTrigger>
				<SelectContent className="max-h-[200px] overflow-y-auto">
					{/* Search input */}
					<div className="p-2 border-b">
						<input
							type="text"
							placeholder="Search cities..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-primary"
							onClick={(e) => e.stopPropagation()} // Prevent dropdown from closing
						/>
					</div>

					<SelectItem value="all">All Cities</SelectItem>
					{filteredCities.length > 0 ? (
						filteredCities.map((city: string) => (
							<SelectItem key={city} value={city}>
								{city}
							</SelectItem>
						))
					) : (
						<div className="p-2 text-sm text-muted-foreground text-center">
							No cities found
						</div>
					)}
				</SelectContent>
			</Select>
		</div>
	);
}
