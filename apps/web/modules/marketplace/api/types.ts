import type { StrapiResponse } from "@repo/utils";

type ImageFormat = {
	name: string;
	hash: string;
	ext: string;
	mime: string;
	path: string | null;
	width: number;
	height: number;
	size: number;
	sizeInBytes: number;
	url: string;
};

// Define Metadata type or use any
interface Metadata {
	[key: string]: any;
}

export interface StrapiImagesData {
	id: number;
	name: string;
	alternativeText?: string | null;
	caption?: string | null;
	width?: number | null;
	height?: number | null;
	formats?: {
		thumbnail?: ImageFormat;
		small?: ImageFormat;
		medium?: ImageFormat;
		large?: ImageFormat;
	};
	url: string;
}

// Attribute entity
export interface AttributeData {
	id: number;
	documentId: string;
	name: string;
	metadata: Metadata;
	type: "text" | "number" | "boolean" | "date" | "select" | "multi-select";
	options?: string[] | null;
	createdAt: string;
	updatedAt: string;
	publishedAt: string;
}

// Category entity
export interface CategoryData {
	id: number;
	documentId: string;
	name: string;
	slug: string;
	description?: string;
	image?: StrapiImagesData;
	parent?: CategoryData;
	categories?: CategoryData[];
	createdAt: string;
	updatedAt: string;
	publishedAt: string;
	attributes?: AttributeData[]; // add this line
}

// Listing entity
export interface ListingData {
	id: number;
	documentId: string;
	title: string;
	description: string;
	price?: number;
	location?: string;
	condition?: string;
	images: StrapiImagesData[];
	categories: CategoryData[];
	productAttributeValues?: ProductAttributeValueData[];
	slug: string;
	createdAt: string;
	updatedAt: string;
	publishedAt: string;
}

// ProductAttributeValue entity
export interface ProductAttributeValueData {
	id: number;
	documentId: string;
	listing: ListingData;
	attribute: AttributeData;
	stringValue?: string;
	numberValue?: number;
	booleanValue?: boolean;
	dateValue?: string;
	createdAt: string;
	updatedAt: string;
	locale?: string;
}

// Response types
export type CategoriesResponse = StrapiResponse<CategoryData[]>;
export type CategoryResponse = StrapiResponse<CategoryData>;
export type ListingsResponse = StrapiResponse<ListingData[]>;
export type ListingResponse = StrapiResponse<ListingData>;
export type AttributesResponse = StrapiResponse<AttributeData[]>;
export type AttributeResponse = StrapiResponse<AttributeData>;
