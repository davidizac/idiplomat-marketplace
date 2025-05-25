/**
 * Category Service
 * Clean service layer for category operations
 */

import { categoryService as cmsService } from "@repo/cms";
import type { Category } from "@repo/cms";

export interface CategoryNode {
	id: string;
	documentId: string;
	slug: string;
	name: string;
	level: number;
	children: CategoryNode[];
	attributes: Array<{
		id: string;
		documentId: string;
		name: string;
		type: string;
		required: boolean;
		options: string[];
		metadata: Record<string, unknown>;
	}>;
}

export interface CategoryPath {
	nodes: CategoryNode[];
	depth: number;
}

export class CategoryService {
	/**
	 * Fetch root categories
	 */
	async getRootCategories(): Promise<CategoryNode[]> {
		const response = await cmsService.getRootCategories();
		return this.transformCategoriesToNodes(response.data, 0);
	}

	/**
	 * Fetch category by slug with full details
	 */
	async getCategoryBySlug(slug: string): Promise<CategoryNode> {
		const category = await cmsService.getCategoryBySlug(slug);
		return this.transformCategoryToNode(category, 0);
	}

	/**
	 * Get category path from root to a specific category
	 */
	async getCategoryPath(slug: string): Promise<CategoryPath> {
		const category = await this.getCategoryBySlug(slug);
		const path = await this.buildCategoryPath(category);

		return {
			nodes: path,
			depth: path.length,
		};
	}

	/**
	 * Get all attributes for a set of categories
	 */
	async getAttributesForCategories(
		categorySlugs: string[],
	): Promise<CategoryNode["attributes"]> {
		const attributesMap = new Map<string, CategoryNode["attributes"][0]>();

		for (const slug of categorySlugs) {
			const category = await this.getCategoryBySlug(slug);
			category.attributes.forEach((attr) => {
				attributesMap.set(attr.documentId, attr);
			});
		}

		return Array.from(attributesMap.values());
	}

	/**
	 * Transform CMS categories to our normalized format
	 */
	private transformCategoriesToNodes(
		categories: Category[],
		level: number,
	): CategoryNode[] {
		return categories.map((category) =>
			this.transformCategoryToNode(category, level),
		);
	}

	/**
	 * Transform a single CMS category to our normalized format
	 */
	private transformCategoryToNode(
		category: Category,
		level: number,
	): CategoryNode {
		return {
			id: category.id.toString(),
			documentId: category.documentId,
			slug: category.slug,
			name: category.name,
			level,
			children: category.categories
				? this.transformCategoriesToNodes(
						category.categories,
						level + 1,
					)
				: [],
			attributes:
				category.attributes?.map((attr) => ({
					id: attr.id.toString(),
					documentId: attr.documentId,
					name: attr.name,
					type: attr.type,
					required: attr.required,
					options: attr.options || [],
					metadata: attr.metadata || {},
				})) || [],
		};
	}

	/**
	 * Build the full path from root to a category
	 */
	private async buildCategoryPath(
		category: CategoryNode,
	): Promise<CategoryNode[]> {
		// This would require parent relationship in the API
		// For now, return just the category itself
		return [category];
	}
}

export const categoryService = new CategoryService();
