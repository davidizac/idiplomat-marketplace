/**
 * Category Service
 * Handles business logic for categories using the  client
 */

import { strapiClient } from "../clients/strapiClient";
import { StrapiQueryBuilder } from "../query";
import type { Category, Response } from "../types/listing";

// Type for  category response with collection
interface CategoryResponse extends Response<Category[]> {}

// Type for  single category response
interface SingleCategoryResponse extends Response<Category> {}

/**
 * Get all categories with optional filtering and pagination
 */
export async function getCategories(params?: {
	page?: number;
	pageSize?: number;
	sort?: string;
	parentId?: string | null;
	populate?: string[];
}): Promise<{
	data: Category[];
	pagination: {
		page: number;
		pageSize: number;
		pageCount: number;
		total: number;
	};
}> {
	// Build query using the query builder
	const query = new StrapiQueryBuilder();

	// Add pagination if specified
	if (params?.page && params?.pageSize) {
		query.paginate(params.page, params.pageSize);
	} else {
		query.paginate(1, 100); // Default pagination
	}

	// Add sort if specified
	if (params?.sort) {
		query.sort(params.sort);
	} else {
		query.sort("name:asc"); // Default sort
	}

	// Add parent filter if specified
	if (params?.parentId !== undefined) {
		if (params.parentId === null) {
			// Filter for root categories (no parent)
			query.where({ parent: { id: { $null: true } } });
		} else {
			// Filter for categories with specific parent
			query.where({ parent: { id: { $eq: params.parentId } } });
		}
	}

	// Add population - always include parent, and add any custom populate fields
	const fieldsToPopulate = ["parent"];
	if (params?.populate && Array.isArray(params.populate)) {
		fieldsToPopulate.push(...params.populate);
	}
	query.populate(fieldsToPopulate);

	// Make the API call
	const queryString = query.build();
	const response = await strapiClient.get<CategoryResponse>(
		`/categories?${queryString}`,
	);

	// Map to domain types
	return {
		data: response.data,
		pagination: response.meta.pagination || {
			page: 1,
			pageSize: response.data.length,
			pageCount: 1,
			total: response.data.length,
		},
	};
}

/**
 * Get root categories (categories with no parent)
 */
export async function getRootCategories(params?: {
	page?: number;
	pageSize?: number;
	sort?: string;
}): Promise<{
	data: Category[];
	pagination: {
		page: number;
		pageSize: number;
		pageCount: number;
		total: number;
	};
}> {
	return getCategories({
		...params,
		parentId: null,
	});
}

/**
 * Get subcategories for a specific parent category
 */
export async function getSubcategories(
	parentId: string,
	params?: {
		page?: number;
		pageSize?: number;
		sort?: string;
	},
): Promise<{
	data: Category[];
	pagination: {
		page: number;
		pageSize: number;
		pageCount: number;
		total: number;
	};
}> {
	return getCategories({
		...params,
		parentId,
	});
}

/**
 * Get a single category by ID
 */
export async function getCategoryById(id: string | number): Promise<Category> {
	// Build query to populate parent
	const query = new StrapiQueryBuilder().populate(["parent"]).build();

	// Make the API call
	const response = await strapiClient.get<SingleCategoryResponse>(
		`/categories/${id}?${query}`,
	);

	// Map to domain type
	return response.data;
}

/**
 * Get a single category by slug
 */
export async function getCategoryBySlug(slug: string): Promise<Category> {
	// Build query for slug lookup
	const query = new StrapiQueryBuilder()
		.where({ slug: { $eq: slug } })
		.populate(["parent", "attributes", "categories"])
		.build();

	// Make the API call
	const response = await strapiClient.get<CategoryResponse>(
		`/categories?${query}`,
	);

	// Verify we have data
	if (
		!response.data ||
		!Array.isArray(response.data) ||
		response.data.length === 0
	) {
		throw new Error(`Category with slug '${slug}' not found`);
	}

	// Map to domain type
	return response.data[0];
}

/**
 * Create a new category
 */
export async function createCategory(data: {
	name: string;
	slug: string;
	description?: string;
	parentId?: string;
}): Promise<Category> {
	// Transform to  format
	const strapiData: any = {
		name: data.name,
		slug: data.slug,
		description: data.description || null,
	};

	// Add parent reference if specified
	if (data.parentId) {
		strapiData.parent = data.parentId;
	}

	// Make the API call
	const response = await strapiClient.post<SingleCategoryResponse>(
		"/categories",
		strapiData,
	);

	// Map response back to domain type
	return response.data;
}

/**
 * Update an existing category
 */
export async function updateCategory(
	id: string | number,
	data: {
		name?: string;
		slug?: string;
		description?: string;
		parentId?: string | null;
	},
): Promise<Category> {
	// Transform to  format
	const strapiData: any = {};

	if (data.name !== undefined) strapiData.name = data.name;
	if (data.slug !== undefined) strapiData.slug = data.slug;
	if (data.description !== undefined)
		strapiData.description = data.description;

	// Handle parent updates
	if (data.parentId !== undefined) {
		if (data.parentId === null) {
			// Remove parent (make it a root category)
			strapiData.parent = null;
		} else {
			// Set parent
			strapiData.parent = data.parentId;
		}
	}

	// Make the API call with direct path
	const response = await strapiClient.put<SingleCategoryResponse>(
		`/categories/${id}`,
		strapiData,
	);

	// Map response back to domain type
	return response.data;
}

/**
 * Delete a category
 */
export async function deleteCategory(id: string | number): Promise<void> {
	await strapiClient.delete("/categories", id);
}
