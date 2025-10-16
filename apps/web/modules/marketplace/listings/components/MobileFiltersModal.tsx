"use client";

import type { Category, FilterManager } from "@repo/cms";
import { Button } from "@ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@ui/components/dialog";
import { Separator } from "@ui/components/separator";
import { useCallback, useMemo } from "react";
import { AttributesManager } from "../../components/AttributesManager";
import type { AttributeValue } from "./filters/AttributeFilter";
import { CityFilter } from "./filters/CityFilter";
import { SearchFilter } from "./filters/SearchFilter";

interface MobileFiltersModalProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	selectedCategory: Category | null;
	filterManager: FilterManager;
	onUpdateAttributeFilter: (
		attributeDocumentId: string,
		attributeName: string,
		value: AttributeValue,
	) => void;
	onUpdateSearch: (searchTerm: string | null) => void;
	onUpdateAddress: (address: string | null) => void;
	onClearFilters: () => void;
}

export function MobileFiltersModal({
	isOpen,
	onOpenChange,
	selectedCategory,
	filterManager,
	onUpdateAttributeFilter,
	onUpdateSearch,
	onUpdateAddress,
	onClearFilters,
}: MobileFiltersModalProps) {
	// Build selected categories array for AttributesManager
	const selectedCategories = useMemo(
		() =>
			selectedCategory
				? [
						{
							slug: selectedCategory.slug,
							name: selectedCategory.name,
							documentId: selectedCategory.documentId,
							level: 0,
						},
					]
				: [],
		[selectedCategory],
	);

	// Get attribute values from FilterManager
	const getAttributeValue = useCallback(
		(attributeDocumentId: string): AttributeValue => {
			const filterId = attributeDocumentId;
			const filter = filterManager.getFilter(filterId);

			if (filter) {
				if (
					filter.valueType === "date" &&
					typeof filter.value === "string"
				) {
					return new Date(filter.value);
				}
				return filter.value as AttributeValue;
			}
			return null;
		},
		[filterManager],
	);

	// Get current search value
	const currentSearchValue = useMemo((): string | null => {
		const searchFilter = filterManager.getFilter("search");
		return searchFilter ? (searchFilter.value as string) : null;
	}, [filterManager]);

	// Get current address value
	const currentAddressValue = useMemo((): string | null => {
		const addressFilter = filterManager.getFilter("address");
		return addressFilter ? (addressFilter.value as string) : null;
	}, [filterManager]);

	const handleApply = useCallback(() => {
		onOpenChange(false);
	}, [onOpenChange]);

	const handleClearFilters = useCallback(() => {
		onClearFilters();
		onOpenChange(false);
	}, [onClearFilters, onOpenChange]);

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md h-[85vh] p-0 flex flex-col">
				<DialogHeader className="px-6 py-4 border-b">
					<DialogTitle>Filters</DialogTitle>
				</DialogHeader>

				<div className="flex-1 overflow-y-auto px-6">
					<div className="py-4 space-y-6">
						{/* Search Filter */}
						<SearchFilter
							value={currentSearchValue}
							onSearch={onUpdateSearch}
						/>

						<Separator />

						{/* City Filter */}
						<CityFilter
							value={currentAddressValue}
							onChange={onUpdateAddress}
							label="City"
						/>

						{/* Attribute Filters - Only show if category is selected */}
						{selectedCategory && selectedCategories.length > 0 && (
							<>
								<Separator />
								<div className="space-y-4">
									<h3 className="text-sm font-semibold">
										{selectedCategory.name} Filters
									</h3>
									<AttributesManager
										selectedCategories={selectedCategories}
										isFilter={true}
										getAttributeValue={getAttributeValue}
										onChange={onUpdateAttributeFilter}
									/>
								</div>
							</>
						)}
					</div>
				</div>

				{/* Footer */}
				<div className="border-t px-6 py-4 space-y-2">
					<Button className="w-full" onClick={handleApply}>
						Apply Filters
					</Button>
					<Button
						className="w-full"
						variant="outline"
						onClick={handleClearFilters}
					>
						Clear All Filters
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
