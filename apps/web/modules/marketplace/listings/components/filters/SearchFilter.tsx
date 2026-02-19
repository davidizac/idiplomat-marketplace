"use client";

import { Input } from "@ui/components/input";
import { Label } from "@ui/components/label";
import { SearchIcon, XIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";

interface SearchFilterProps {
	value?: string | null;
	onSearch?: (searchTerm: string | null) => void;
	placeholder?: string;
	label?: string;
	debounceMs?: number;
}

export function SearchFilter({
	value = "",
	onSearch,
	placeholder,
	label,
	debounceMs = 300,
}: SearchFilterProps) {
	const t = useTranslations("marketplace.filters");
	const resolvedPlaceholder = placeholder ?? t("searchPlaceholder");
	const resolvedLabel = label ?? t("search");
	const [searchValue, setSearchValue] = useState(value || "");
	const onSearchRef = useRef(onSearch);
	const isInitialMount = useRef(true);

	// Keep the ref updated with the latest callback
	useEffect(() => {
		onSearchRef.current = onSearch;
	}, [onSearch]);

	// Debounced search effect - removed onSearch from dependencies to prevent infinite loop
	useEffect(() => {
		// Skip calling onSearch on initial mount to prevent unnecessary filter updates
		if (isInitialMount.current) {
			isInitialMount.current = false;
			return;
		}

		const timeoutId = setTimeout(() => {
			if (onSearchRef.current) {
				onSearchRef.current(
					searchValue.trim() === "" ? null : searchValue.trim(),
				);
			}
		}, debounceMs);

		return () => clearTimeout(timeoutId);
	}, [searchValue, debounceMs]);

	// Update internal state when external value changes
	useEffect(() => {
		setSearchValue(value || "");
	}, [value]);

	// Handle input changes
	const handleInputChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setSearchValue(e.target.value);
		},
		[],
	);

	// Handle clear button
	const handleClear = useCallback(() => {
		setSearchValue("");
		if (onSearchRef.current) {
			onSearchRef.current(null);
		}
	}, []);

	return (
		<div className="space-y-2">
			<Label htmlFor="search-input">{resolvedLabel}</Label>
			<div className="relative">
				<SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					id="search-input"
					type="text"
					placeholder={resolvedPlaceholder}
					value={searchValue}
					onChange={handleInputChange}
					className="pl-10 pr-10"
				/>
				{searchValue && (
					<button
						type="button"
						onClick={handleClear}
						className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
						aria-label={t("clearSearchAria")}
					>
						<XIcon className="h-4 w-4" />
					</button>
				)}
			</div>
		</div>
	);
}
