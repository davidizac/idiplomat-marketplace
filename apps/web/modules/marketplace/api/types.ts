/**
 * API Types
 * Export types from the CMS package and additional API-specific types
 */

import type {
	Attribute,
	AttributeValue,
	Category,
	Listing,
	ListingFilterParams,
	PaginationParams,
	SortParams,
} from "@repo/cms/types";

// Re-export CMS types
export type {
	Attribute,
	AttributeValue,
	Category,
	Listing,
	ListingFilterParams,
	PaginationParams,
	SortParams,
};

// Common response types
export interface Response<T> {
	data: T;
	meta: {
		pagination?: {
			page: number;
			pageSize: number;
			pageCount: number;
			total: number;
		};
	};
}

// Listing response format
export interface ListingResponse {
	data: Listing;
}

// Listings response format
export interface ListingsResponse {
	data: Listing[];
	meta: {
		pagination: {
			page: number;
			pageSize: number;
			pageCount: number;
			total: number;
		};
	};
}

// Category response format
export interface CategoryResponse {
	data: Category;
}

// Categories response format
export interface CategoriesResponse {
	data: Category[];
	meta: {
		pagination: {
			page: number;
			pageSize: number;
			pageCount: number;
			total: number;
		};
	};
}

// Use for strongly typing listing data in Components
export type ListingData = Listing;
