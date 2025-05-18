import { getStrapiImageUrl, strapiFetch } from "@repo/utils";
import type {
	CategoriesResponse,
	CategoryResponse,
	ListingResponse,
	ListingsResponse,
} from "./types";

/**
 * Fetch categories from Strapi
 */
export async function getCategories(
	params: {
		page?: number;
		pageSize?: number;
		sort?: string;
		filters?: Record<string, any>;
	} = {},
): Promise<CategoriesResponse> {
	return strapiFetch<CategoriesResponse>(
		`/categories?populate[categories][populate][0]=attributes&populate=attributes&pagination[pageSize]=${params.pageSize || 25}${params.sort ? `&sort=${params.sort}` : ""}`,
	);
}

/**
 * Fetch a single category by ID
 */
export async function getCategoryById(
	id: string | number,
): Promise<CategoryResponse> {
	return strapiFetch<CategoryResponse>(
		`/categories/${id}?populate[categories][populate][0]=attributes&populate=attributes`,
	);
}

/**
 * Fetch a single category by slug
 */
export async function getCategoryBySlug(
	slug: string,
): Promise<CategoryResponse> {
	return strapiFetch<CategoryResponse>(
		`/categories?filters[slug][$eq]=${slug}&populate[categories][populate][0]=attributes&populate=attributes`,
	).then((response) => {
		if (
			!response.data ||
			!Array.isArray(response.data) ||
			response.data.length === 0
		) {
			throw new Error(`Category with slug '${slug}' not found`);
		}

		return {
			data: response.data[0],
			meta: response.meta,
		};
	});
}

/**
 * Fetch listings from Strapi with filtering and pagination
 */
export async function getListings(
	params: {
		page?: number;
		pageSize?: number;
		sort?: string;
		filters?: Record<string, any>;
	} = {},
): Promise<ListingsResponse> {
	let queryString = `pagination[page]=${params.page || 1}&pagination[pageSize]=${params.pageSize || 25}`;

	if (params.sort) {
		queryString += `&sort=${params.sort}`;
	}

	if (params.filters && Object.keys(params.filters).length > 0) {
		queryString += `&filters=${encodeURIComponent(JSON.stringify(params.filters))}`;
	}

	return strapiFetch<ListingsResponse>(
		`/listings?${queryString}&populate[categories][populate][0]=attributes&populate[categories][populate][1]=categories&populate[categories][populate][2]=parent&populate=images&populate[product_attribute_values][populate][0]=attribute`,
	);
}

/**
 * Fetch a single listing by ID
 */
export async function getListingById(
	id: string | number,
): Promise<ListingResponse> {
	return strapiFetch<ListingResponse>(
		`/listings/${id}?populate[categories][populate][0]=attributes&populate[categories][populate][1]=categories&populate[categories][populate][2]=parent&populate=images&populate[product_attribute_values][populate][0]=attribute`,
	);
}

/**
 * Fetch a single listing by slug
 */
export async function getListingBySlug(slug: string): Promise<ListingResponse> {
	return strapiFetch<ListingResponse>(
		`/listings?filters[slug][$eq]=${slug}&populate[categories][populate][0]=attributes&populate[categories][populate][1]=categories&populate[categories][populate][2]=parent&populate=images&populate[product_attribute_values][populate][0]=attribute`,
	).then((response) => {
		if (
			!response.data ||
			!Array.isArray(response.data) ||
			response.data.length === 0
		) {
			throw new Error(`Listing with slug '${slug}' not found`);
		}

		return {
			data: response.data[0],
			meta: response.meta,
		};
	});
}

/**
 * Helper to get a processed image URL from Strapi
 */
export function getImageUrl(image: any): string {
	if (!image) return "";

	if (typeof image === "string") {
		return getStrapiImageUrl(image);
	}

	if (image.data?.attributes?.url) {
		return getStrapiImageUrl(image.data.attributes.url);
	}

	if (image.attributes?.url) {
		return getStrapiImageUrl(image.attributes.url);
	}

	if (image.url) {
		return getStrapiImageUrl(image.url);
	}

	return "";
}
