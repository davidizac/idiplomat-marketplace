"use client";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@ui/components/select";
import { useEffect, useState } from "react";

interface LocationFilterProps {
	onChange: (locationId: string) => void;
	selectedLocation: string;
}

interface City {
	id: string;
	name: string;
}

export const cities: City[] = [
	{ id: "all", name: "All Locations" },
	{ id: "tel-aviv", name: "Tel Aviv" },
	{ id: "jerusalem", name: "Jerusalem" },
	{ id: "haifa", name: "Haifa" },
	{ id: "beer-sheva", name: "Beer Sheva" },
	{ id: "eilat", name: "Eilat" },
];

export function LocationFilter({
	onChange,
	selectedLocation,
}: LocationFilterProps) {
	// Add local state to control the select
	const [value, setValue] = useState(selectedLocation);

	// Only update when prop changes
	useEffect(() => {
		setValue(selectedLocation);
	}, [selectedLocation]);

	// Handle value change
	const handleValueChange = (newValue: string) => {
		setValue(newValue);
		onChange(newValue);
	};

	return (
		<div className="space-y-4">
			<h3 className="font-semibold">Location</h3>
			{/* Use local state for value */}
			<Select value={value} onValueChange={handleValueChange}>
				<SelectTrigger>
					<SelectValue placeholder="Select city" />
				</SelectTrigger>
				<SelectContent>
					{cities.map((city) => (
						<SelectItem key={city.id} value={city.id}>
							{city.name}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}
