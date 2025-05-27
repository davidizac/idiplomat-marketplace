/**
 * Listing Types
 * Contains both -specific and domain types for listings
 */

//  Response Structure
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

// Base  Attributes
interface BaseAttributes {
	createdAt: string;
	updatedAt: string;
	publishedAt: string;
}

//  Image Type
export interface Image extends BaseAttributes {
	id: number;
	name: string;
	alternativeText: string | null;
	caption: string | null;
	width: number;
	height: number;
	formats: {
		thumbnail?: {
			url: string;
			width: number;
			height: number;
		};
		small?: {
			url: string;
			width: number;
			height: number;
		};
		medium?: {
			url: string;
			width: number;
			height: number;
		};
		large?: {
			url: string;
			width: number;
			height: number;
		};
	};
	hash: string;
	ext: string;
	mime: string;
	size: number;
	url: string;
	previewUrl: string | null;
	provider: string;
}

//  Category Type
export interface Category extends BaseAttributes {
	id: number;
	documentId: string;
	name: string;
	slug: string;
	description: string | null;
	categories: Category[];
	attributes: Attribute[];
	icon: Image;
	parent: Category | null;
}

//  Attribute Type
export interface Attribute {
	id: number;
	documentId: string;
	name: string;
	type: string;
	required: boolean;
	options: string[];
	metadata: Record<string, unknown>;
}

//  Attribute Value
export interface AttributeValue {
	id: number;

	value: string;
	attribute: Attribute;
}

//  Listing Type (API response)
export interface Listing extends BaseAttributes {
	id: number;
	documentId: string;
	title: string;
	description: string;
	price?: number;
	address: string; // City name from predefined list
	slug: string;
	status: string;
	images: Image[];
	categories: Category[];
	product_attribute_values: AttributeValue[];
	type: "rent" | "sale" | "free";
	rental_price?: number;
	rental_period?: "hourly" | "daily" | "weekly" | "monthly";
}

//  Listing Collection Response
export interface ListingResponse extends Response<Listing[]> {}

//  Single Listing Response
export interface SingleListingResponse extends Response<Listing> {}

// Filter parameters for listings
export interface ListingFilterParams {
	page?: number;
	pageSize?: number;
	sort?: string;
	search?: string;
	address?: string; // City name filter
	subCategories?: string[];
	attributeFilters?: Array<{
		attribute: string;
		value: string;
		operator?: "and" | "or";
	}>;
	/**
	 * Optional category slug to filter listings by their category.
	 */
	category?: string;
}

// Pagination params
export interface PaginationParams {
	page?: number;
	pageSize?: number;
}

// Sort params
export interface SortParams {
	sort?: string;
}
