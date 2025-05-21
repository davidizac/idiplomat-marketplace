/**
 * Category Service
 * Class-based service for handling categories using the Strapi client
 */

import { strapiCollections } from "../clients/strapiClient";
import { StrapiQueryBuilder } from "../query";
import type { Category } from "../types/listing";

/**
 * Category Service Class
 * Provides CRUD operations for categories with proper relation handling
 */
export class CategoryService {
	/**
	 * Get all categories with optional filtering and pagination
	 */
	async getCategories(params?: {
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

		// Make the API call using @strapi/client
		const queryParams = query.buildObject();
		const response = await strapiCollections.categories().find(queryParams);

		// Map Strapi data to our domain types
		const categories = response.data as Category[];

		// Return formatted response
		return {
			data: categories,
			pagination: response.meta.pagination || {
				page: 1,
				pageSize: categories.length,
				pageCount: 1,
				total: categories.length,
			},
		};
	}

	/**
	 * Get root categories (categories with no parent)
	 */
	async getRootCategories(params?: {
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
		return this.getCategories({
			...params,
			parentId: null,
		});
	}

	/**
	 * Get subcategories for a specific parent category
	 */
	async getSubcategories(
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
		return this.getCategories({
			...params,
			parentId,
		});
	}

	/**
	 * Get a single category by ID
	 */
	async getCategoryById(id: string): Promise<Category> {
		// Use @strapi/client findOne method
		const response = await strapiCollections.categories().findOne(id, {
			populate: ["parent", "attributes", "categories", "icon"],
		});

		// Map Strapi data to our domain type
		return response.data as Category;
	}

	/**
	 * Get a single category by slug
	 */
	async getCategoryBySlug(slug: string): Promise<Category> {
		// Build query parameters with deep population
		const queryParams = {
			filters: {
				slug: { $eq: slug },
			},
			populate: {
				parent: true,
				attributes: true,
				categories: {
					populate: {
						attributes: true, // Also populate attributes of subcategories
						categories: true, // Populate nested subcategories
					},
				},
				icon: true,
			},
		};

		console.log("CMS: Fetching category by slug:", slug);

		// Make the API call
		const response = await strapiCollections.categories().find(queryParams);

		// Verify we have data
		if (
			!response.data ||
			!Array.isArray(response.data) ||
			response.data.length === 0
		) {
			console.error("CMS: Category not found:", slug);
			throw new Error(`Category with slug '${slug}' not found`);
		}

		// Map Strapi data to our domain type
		const categories = response.data;
		console.log("CMS: Found category:", categories[0]);
		return categories[0] as Category;
	}

	/**
	 * Create a new category with related data
	 */
	async createCategory(data: {
		name: string;
		slug: string;
		description?: string;
		parentId?: string;
		iconId?: string | number;
		attributeDocumentIds?: Array<string | number>;
	}): Promise<Category> {
		// Prepare the category data
		const categoryData: Record<string, any> = {
			name: data.name,
			slug: data.slug,
			description: data.description || null,
		};

		// Add parent reference if specified
		if (data.parentId) {
			categoryData.parent = data.parentId;
		}

		// Add icon if specified
		if (data.iconId) {
			categoryData.icon = data.iconId;
		}

		// Add attributes if specified
		if (data.attributeDocumentIds && data.attributeDocumentIds.length > 0) {
			categoryData.attributes = data.attributeDocumentIds;
		}

		// Use @strapi/client create method
		const response = await strapiCollections
			.categories()
			.create(categoryData);

		// Map Strapi data to our domain type and get the complete category with relations
		const category = response.data;
		return this.getCategoryById(category.id.toString());
	}

	/**
	 * Update an existing category with relations
	 */
	async updateCategory(
		id: string,
		data: Partial<{
			name: string;
			slug: string;
			description: string;
			parentId: string | null;
			iconId: string | number | null;
			attributeDocumentIds: Array<string | number> | null;
		}>,
	): Promise<Category> {
		// Prepare the category data
		const categoryData: Record<string, any> = {};

		// Update basic fields if provided
		if (data.name !== undefined) categoryData.name = data.name;
		if (data.slug !== undefined) categoryData.slug = data.slug;
		if (data.description !== undefined)
			categoryData.description = data.description;

		// Handle parent updates
		if (data.parentId !== undefined) {
			categoryData.parent = data.parentId; // null will remove the parent
		}

		// Handle icon updates
		if (data.iconId !== undefined) {
			categoryData.icon = data.iconId; // null will remove the icon
		}

		// Handle attributes updates
		if (data.attributeDocumentIds !== undefined) {
			categoryData.attributes = data.attributeDocumentIds; // empty array will remove all attributes
		}

		// Use @strapi/client update method
		const response = await strapiCollections
			.categories()
			.update(id, categoryData);

		// Map Strapi data to our domain type and get the complete category with relations
		const category = response.data;
		return this.getCategoryById(category.id.toString());
	}

	/**
	 * Delete a category
	 * Note: This will not delete subcategories, they will become root categories
	 */
	async deleteCategory(id: string): Promise<void> {
		await strapiCollections.categories().delete(id);
	}

	/**
	 * Delete a category and reassign its subcategories to another parent
	 */
	async deleteCategoryAndReassignChildren(
		id: string,
		newParentId?: string,
	): Promise<void> {
		// Get the category to find subcategories
		const category = await this.getCategoryById(id);

		// If there are subcategories, update their parent
		if (category.categories && category.categories.length > 0) {
			for (const subcategory of category.categories) {
				await this.updateCategory(subcategory.id.toString(), {
					parentId: newParentId || null, // Assign to new parent or make them root categories
				});
			}
		}

		// Delete the category
		await strapiCollections.categories().delete(id);
	}
}

// Create and export a singleton instance
export const categoryService = new CategoryService();

// Export individual methods for backward compatibility
export const getCategories =
	categoryService.getCategories.bind(categoryService);
export const getRootCategories =
	categoryService.getRootCategories.bind(categoryService);
export const getSubcategories =
	categoryService.getSubcategories.bind(categoryService);
export const getCategoryById =
	categoryService.getCategoryById.bind(categoryService);
export const getCategoryBySlug =
	categoryService.getCategoryBySlug.bind(categoryService);
export const createCategory =
	categoryService.createCategory.bind(categoryService);
export const updateCategory =
	categoryService.updateCategory.bind(categoryService);
export const deleteCategory =
	categoryService.deleteCategory.bind(categoryService);
export const deleteCategoryAndReassignChildren =
	categoryService.deleteCategoryAndReassignChildren.bind(categoryService);
