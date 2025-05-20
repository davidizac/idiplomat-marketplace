/**
 * Categories Loader
 * Server-side data loading for category pages
 */

import {
	type Category,
	getCategories,
	getCategoryById,
	getCategoryBySlug,
} from "@repo/cms";

/**
 * Load all categories with error handling
 */
export async function loadCategories(params?: {
	page?: number;
	pageSize?: number;
	sort?: string;
	parentId?: string | null;
}): Promise<{
	data: Category[];
	pagination: {
		page: number;
		pageSize: number;
		pageCount: number;
		total: number;
	};
}> {
	try {
		// Fetch categories using the CMS service
		const response = await getCategories(params);
		return {
			data: response.data,
			pagination: response.pagination || {
				page: params?.page || 1,
				pageSize: params?.pageSize || 20,
				pageCount: 0,
				total: 0,
			},
		};
	} catch (error) {
		console.error("Error loading categories:", error);

		// Return empty data with pagination for error cases
		return {
			data: [],
			pagination: {
				page: params?.page || 1,
				pageSize: params?.pageSize || 20,
				pageCount: 0,
				total: 0,
			},
		};
	}
}

/**
 * Load root categories (categories with no parent)
 */
export async function loadRootCategories(params?: {
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
	try {
		// Fetch root categories using the CMS service
		const response = await getCategories({
			...params,
			parentId: null,
		});
		return {
			data: response.data,
			pagination: response.pagination || {
				page: params?.page || 1,
				pageSize: params?.pageSize || 20,
				pageCount: 0,
				total: 0,
			},
		};
	} catch (error) {
		console.error("Error loading root categories:", error);

		// Return empty data with pagination for error cases
		return {
			data: [],
			pagination: {
				page: params?.page || 1,
				pageSize: params?.pageSize || 20,
				pageCount: 0,
				total: 0,
			},
		};
	}
}

/**
 * Load a single category by ID with error handling
 */
export async function loadCategoryById(id: string): Promise<Category | null> {
	try {
		// Fetch category using the CMS service
		const category = await getCategoryById(id);
		return category;
	} catch (error) {
		console.error(`Error loading category with ID ${id}:`, error);
		return null;
	}
}

/**
 * Load a single category by slug with error handling
 */
export async function loadCategoryBySlug(
	slug: string,
): Promise<Category | null> {
	try {
		// Fetch category using the CMS service
		const category = await getCategoryBySlug(slug);
		return category;
	} catch (error) {
		console.error(`Error loading category with slug '${slug}':`, error);
		return null;
	}
}
