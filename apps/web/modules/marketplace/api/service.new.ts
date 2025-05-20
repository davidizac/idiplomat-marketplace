import { getStrapiImageUrl, strapiFetch } from "@repo/utils";
import * as queryString from "qs";
import type {
	CategoriesResponse,
	CategoryResponse,
	ListingResponse,
	ListingsResponse,
} from "./types";

// Types for query parameters
interface PaginationParams {
	page?: number;
	pageSize?: number;
}

interface SortParams {
	sort?: string;
}

interface AttributeFilter {
	attribute: string;
	value: string;
	operator?: "and" | "or";
}

interface ListingFilterParams extends PaginationParams, SortParams {
	subCategories?: string[];
	attributeFilters?: AttributeFilter[];
}

/**
 * Builds query parameters for Strapi API calls
 */
const queryBuilder = {
	/**
	 * Build category query parameters with populate options
	 */
	buildCategoryQuery(params: PaginationParams & SortParams = {}) {
		return queryString.stringify({
			populate: {
				categories: {
					populate: ["attributes", "categories"],
				},
				attributes: true,
			},
			pagination: {
				pageSize: params.pageSize || 25,
			},
			...(params.sort ? { sort: params.sort } : {}),
		});
	},

	/**
	 * Build query parameters for a single category by slug
	 */
	buildCategoryBySlugQuery(slug: string) {
		return queryString.stringify({
			filters: {
				slug: {
					$eq: slug,
				},
			},
			populate: {
				categories: {
					populate: ["attributes", "categories"],
				},
				attributes: true,
			},
		});
	},

	/**
	 * Build complex query for listings with filtering
	 */
	buildListingsQuery(params: ListingFilterParams = {}) {
		const query: any = {
			pagination: {
				page: params.page || 1,
				pageSize: params.pageSize || 25,
			},
			populate: {
				categories: {
					populate: ["attributes", "parent"],
				},
				images: true,
				product_attribute_values: {
					populate: ["attribute"],
				},
			},
		};

		if (params.sort) {
			query.sort = params.sort;
		}

		// Handle attribute filters
		if (params.attributeFilters && params.attributeFilters.length > 0) {
			// Group attributes by name and operator for proper filtering
			const attributeGroups = new Map<
				string,
				{ values: string[]; operator: "and" | "or" }
			>();

			params.attributeFilters.forEach((filter) => {
				const attributeName = filter.attribute;
				const value = filter.value;
				const operator = filter.operator || "and";

				if (!attributeGroups.has(attributeName)) {
					attributeGroups.set(attributeName, {
						values: [value],
						operator,
					});
				} else {
					attributeGroups.get(attributeName)!.values.push(value);
					// Override operator if specified
					if (filter.operator) {
						attributeGroups.get(attributeName)!.operator = operator;
					}
				}
			});

			// Build the filter structure using $and/$or logic
			query.filters = { $and: [] };

			attributeGroups.forEach((group, attributeName) => {
				if (group.operator === "or" && group.values.length > 1) {
					// Use $or for multiple values of the same attribute
					const orFilters = group.values.map((value) => ({
						product_attribute_values: {
							attribute: {
								name: { $eq: attributeName },
							},
							value: { $eq: value },
						},
					}));
					query.filters.$and.push({ $or: orFilters });
				} else {
					// Use $and for single values or when AND operator is specified
					group.values.forEach((value) => {
						query.filters.$and.push({
							product_attribute_values: {
								attribute: {
									name: { $eq: attributeName },
								},
								value: { $eq: value },
							},
						});
					});
				}
			});
		}

		return queryString.stringify(query);
	},

	/**
	 * Build query parameters for a single listing by slug
	 */
	buildListingBySlugQuery(slug: string) {
		return queryString.stringify({
			filters: {
				slug: {
					$eq: slug,
				},
			},
			populate: {
				categories: {
					populate: ["attributes", "categories", "parent"],
				},
				images: true,
				product_attribute_values: {
					populate: ["attribute"],
				},
			},
		});
	},
};

/**
 * Fetch categories from Strapi
 */
export async function getCategories(
	params: PaginationParams & SortParams = {},
): Promise<CategoriesResponse> {
	const queryString = queryBuilder.buildCategoryQuery(params);
	return strapiFetch<CategoriesResponse>(`/categories?${queryString}`);
}

/**
 * Fetch a single category by ID
 */
export async function getCategoryById(
	id: string | number,
): Promise<CategoryResponse> {
	const queryString = queryBuilder.buildCategoryQuery();
	return strapiFetch<CategoryResponse>(`/categories/${id}?${queryString}`);
}

/**
 * Fetch a single category by slug
 */
export async function getCategoryBySlug(
	slug: string,
): Promise<CategoryResponse> {
	const queryString = queryBuilder.buildCategoryBySlugQuery(slug);
	return strapiFetch<CategoryResponse>(`/categories?${queryString}`).then(
		(response) => {
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
		},
	);
}

/**
 * Fetch listings from Strapi with filtering and pagination
 */
export async function getListings(
	params: ListingFilterParams = {},
): Promise<ListingsResponse> {
	const queryString = queryBuilder.buildListingsQuery(params);
	return strapiFetch<ListingsResponse>(`/listings?${queryString}`);
}

/**
 * Fetch a single listing by ID
 */
export async function getListingById(
	id: string | number,
): Promise<ListingResponse> {
	const queryString = queryBuilder.buildListingsQuery();
	return strapiFetch<ListingResponse>(`/listings/${id}?${queryString}`);
}

/**
 * Fetch a single listing by slug
 */
export async function getListingBySlug(slug: string): Promise<ListingResponse> {
	const queryString = queryBuilder.buildListingBySlugQuery(slug);
	return strapiFetch<ListingResponse>(`/listings?${queryString}`).then(
		(response) => {
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
		},
	);
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
