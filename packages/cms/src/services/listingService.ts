/**
 * Listing Service
 * Class-based service for handling listings using the Strapi client
 */

import { strapiCollections } from "../clients/strapiClient";
import { uploadFiles } from "../clients/strapiClient";
import { NEWEST_FIRST } from "../query/sort";
import { StrapiQueryBuilder } from "../query/strapiQueryBuilder";
import type { Listing, ListingFilterParams } from "../types/listing";

/**
 * Listing Service Class
 * Provides CRUD operations for listings with proper relation handling
 */
export class ListingService {
	/**
	 * Get listings with filtering, sorting, and pagination
	 */
	async getListings(params: ListingFilterParams = {}): Promise<{
		data: Listing[];
		pagination: {
			page: number;
			pageSize: number;
			pageCount: number;
			total: number;
		};
	}> {
		// Build query using the query builder
		const query = new StrapiQueryBuilder()
			.paginate(params.page || 1, params.pageSize || 25)
			.sort(params.sort || NEWEST_FIRST);

		// ---------------------------------------------------------------------
		// Category & Sub-category filtering
		// ---------------------------------------------------------------------
		// If multiple sub-categories are provided, filter by them.
		// Otherwise, if a single category slug is provided, filter by it.
		if (params.subCategories && params.subCategories.length > 0) {
			if (params.subCategories.length === 1) {
				query.where({
					categories: {
						slug: { $eq: params.subCategories[0] },
					},
				});
			} else {
				const orFilters = params.subCategories.map((slug) => ({
					categories: {
						slug: { $eq: slug },
					},
				}));

				query.where({ $or: orFilters });
			}
		} else if (params.category) {
			// Fallback to single category filter when no sub-categories provided
			query.where({
				categories: {
					slug: { $eq: params.category },
				},
			});
		}

		// Add attribute filters if provided
		if (params.attributeFilters && params.attributeFilters.length > 0) {
			params.attributeFilters.forEach((filter) => {
				query.where({
					product_attribute_values: {
						attribute: {
							name: { $eq: filter.attribute },
						},
						value: { $eq: filter.value },
					},
				});
			});
		}

		// Add keyword search filter if provided
		if (params.search && params.search.trim() !== "") {
			const searchTerm = params.search.trim();
			query.where({
				$or: [
					{
						title: {
							$containsi: searchTerm,
						},
					},
					{
						description: {
							$containsi: searchTerm,
						},
					},
				],
			});
		}

		// Add city filter if provided
		if (params.address && params.address.trim() !== "") {
			const cityTerm = params.address.trim();
			query.where({
				address: {
					$containsi: cityTerm,
				},
			});
		}

		// Add standard population for listings
		query.populate({
			categories: {
				populate: ["attributes", "parent"],
			},
			images: true,
			product_attribute_values: {
				populate: ["attribute"],
			},
		});

		// Make the API call using @strapi/client
		const queryParams = query.buildObject();

		const response = await strapiCollections.listings().find(queryParams);

		// Map Strapi data to our domain types
		const listings = response.data as Listing[];

		// Return formatted response
		return {
			data: listings,
			pagination: response.meta.pagination || {
				page: 1,
				pageSize: listings.length,
				pageCount: 1,
				total: listings.length,
			},
		};
	}

	/**
	 * Get a single listing by ID
	 */
	async getListingById(documentId: string): Promise<Listing> {
		// Use @strapi/client findOne method
		const response = await strapiCollections
			.listings()
			.findOne(documentId, {
				populate: {
					categories: {
						populate: ["attributes", "parent"],
					},
					images: true,
					product_attribute_values: {
						populate: ["attribute"],
					},
				},
			});

		// Map Strapi data to our domain type
		return response.data as Listing;
	}

	/**
	 * Get a single listing by slug
	 */
	async getListingBySlug(slug: string): Promise<Listing> {
		// Build query parameters
		const queryParams = {
			filters: {
				slug: { $eq: slug },
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

		// Make the API call
		const response = await strapiCollections.listings().find(queryParams);

		// Verify we have data
		if (
			!response.data ||
			!Array.isArray(response.data) ||
			response.data.length === 0
		) {
			throw new Error(`Listing with slug '${slug}' not found`);
		}

		// Map Strapi data to our domain type
		const listings = response.data;
		return listings[0] as Listing;
	}

	/**
	 * Create a new listing with related attribute values
	 */
	async createListing(data: {
		title: string;
		description: string;
		address: string;
		type: "rent" | "sale" | "free";
		price?: number;
		rental_price?: number;
		rental_period?: "hourly" | "daily" | "weekly" | "monthly";
		slug: string;
		images?: Array<
			string | number | { data: Blob | Buffer | File; filename?: string }
		>;
		categories?: string[];
		attributeValues?: Array<{
			attributeDocumentId: string;
			value: string;
		}>;
	}): Promise<Listing> {
		// Prepare the listing data
		const listingData: Record<string, any> = {
			title: data.title,
			description: data.description,
			address: data.address,
			type: data.type,
			slug: data.slug,
		};

		// Add pricing fields based on type
		if (data.type === "sale" && data.price !== undefined) {
			listingData.price = data.price;
		}
		if (data.type === "rent") {
			if (data.rental_price !== undefined) {
				listingData.rental_price = data.rental_price;
			}
			if (data.rental_period !== undefined) {
				listingData.rental_period = data.rental_period;
			}
		}

		// Handle image uploads (support mixture of existing IDs and new binary files)
		if (data.images && data.images.length > 0) {
			const existingIds: Array<string | number> = [];
			const newFiles: Array<{
				data: Blob | Buffer | File;
				filename?: string;
			}> = [];

			data.images.forEach((item) => {
				if (typeof item === "string" || typeof item === "number") {
					existingIds.push(item);
				} else if (item && typeof item === "object" && "data" in item) {
					newFiles.push(item as any);
				}
			});

			// Upload new files and get their IDs
			if (newFiles.length > 0) {
				const uploadedIds = await uploadFiles(newFiles);
				existingIds.push(...uploadedIds);
			}

			if (existingIds.length > 0) {
				listingData.images = existingIds;
			}
		}

		if (data.categories && data.categories.length > 0) {
			listingData.categories = data.categories;
		}

		// Create the listing
		const response = await strapiCollections.listings().create(listingData);
		const createdListing = response.data;

		// Create attribute values if provided
		if (data.attributeValues && data.attributeValues.length > 0) {
			const documentIds = await this.createAttributeValues(
				data.attributeValues,
			);
			await strapiCollections
				.listings()
				.update(response.data.documentId, {
					product_attribute_values: {
						connect: documentIds,
					},
				});
		}

		// Fetch the complete listing with all relations
		return this.getListingById(createdListing.documentId);
	}

	/**
	 * Create attribute values for a listing
	 */
	private async createAttributeValues(
		attributeValues: Array<{
			attributeDocumentId: string;
			value: string;
		}>,
	): Promise<string[]> {
		// Create each attribute value
		const documentIds = [];
		for (const attrValue of attributeValues) {
			const data = {
				value: attrValue.value.toString(),
			};

			// Use Strapi API to create product attribute values
			const res = await strapiCollections
				.productAttributeValues()
				.create(data);
			const documentId = res.data.documentId;
			documentIds.push(documentId);

			await strapiCollections
				.productAttributeValues()
				.update(documentId, {
					attribute: {
						connect: attrValue.attributeDocumentId,
					},
				});
		}
		return documentIds;
	}

	/**
	 * Update an existing listing with relations
	 */
	async updateListing(
		documentId: string,
		data: Partial<{
			title: string;
			description: string;
			address: string;
			type: "rent" | "sale" | "free";
			price: number;
			rental_price: number;
			rental_period: "hourly" | "daily" | "weekly" | "monthly";
			slug: string;
			status: string;
			images?: string[] | number[]; // Image IDs
			categories?: string[] | number[]; // Category IDs
			attributeValues?: Array<{
				attributeDocumentId: string;
				value: string;
			}>;
		}>,
	): Promise<Listing> {
		// Prepare the listing data
		const listingData: Record<string, any> = {};

		// Copy basic fields if provided
		if (data.title !== undefined) listingData.title = data.title;
		if (data.description !== undefined)
			listingData.description = data.description;
		if (data.address !== undefined) listingData.address = data.address;
		if (data.type !== undefined) listingData.type = data.type;
		if (data.price !== undefined) listingData.price = data.price;
		if (data.rental_price !== undefined)
			listingData.rental_price = data.rental_price;
		if (data.rental_period !== undefined)
			listingData.rental_period = data.rental_period;
		if (data.slug !== undefined) listingData.slug = data.slug;
		if (data.status !== undefined) listingData.status = data.status;

		// Add relational fields
		if (data.images !== undefined) {
			listingData.images = data.images;
		}

		if (data.categories !== undefined) {
			listingData.categories = data.categories;
		}

		await strapiCollections.listings().update(documentId, listingData);

		// Update attribute values if provided
		if (data.attributeValues && data.attributeValues.length > 0) {
			// First, get existing attribute values
			const currentListing = await this.getListingById(documentId);

			// Delete existing values (simplified approach - in production you might want to update existing)
			if (currentListing.product_attribute_values?.length > 0) {
				for (const attrValue of currentListing.product_attribute_values) {
					await strapiCollections
						.productAttributeValues()
						.delete(attrValue.id.toString());
				}
			}

			// Create new attribute values
			await this.createAttributeValues(data.attributeValues);
		}

		// Fetch the complete listing with all relations
		return this.getListingById(documentId);
	}

	/**
	 * Delete a listing and its related data
	 */
	async deleteListing(id: string): Promise<void> {
		// Get the listing to find related attribute values
		const listing = await this.getListingById(id);

		// Delete related attribute values
		if (listing.product_attribute_values?.length > 0) {
			for (const attrValue of listing.product_attribute_values) {
				await strapiCollections
					.productAttributeValues()
					.delete(attrValue.id.toString());
			}
		}

		// Delete the listing itself
		await strapiCollections.listings().delete(id);
	}
}

// Create and export a singleton instance
export const listingService = new ListingService();

// Export individual methods for backward compatibility
export const getListings = listingService.getListings.bind(listingService);
export const getListingById =
	listingService.getListingById.bind(listingService);
export const getListingBySlug =
	listingService.getListingBySlug.bind(listingService);
export const createListing = listingService.createListing.bind(listingService);
export const updateListing = listingService.updateListing.bind(listingService);
export const deleteListing = listingService.deleteListing.bind(listingService);
