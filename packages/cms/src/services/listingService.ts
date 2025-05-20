/**
 * Listing Service
 * Handles business logic for listings using the  client
 */

import { strapiClient } from "../clients/strapiClient";
import { NEWEST_FIRST } from "../query/sort";
import { StrapiQueryBuilder } from "../query/strapiQueryBuilder";
import type {
	Listing,
	ListingFilterParams,
	ListingResponse,
	SingleListingResponse,
} from "../types/listing";

/**
 * Get listings with filtering, sorting, and pagination
 */
export async function getListings(params: ListingFilterParams = {}): Promise<{
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

	// Make the API call
	const queryString = query.build();
	const response = await strapiClient.get<ListingResponse>(
		`/listings?${queryString}`,
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
 * Get a single listing by ID
 */
export async function getListingById(id: string | number): Promise<Listing[]> {
	// Build query using the static helper
	const query = StrapiQueryBuilder.forListingById().where({ id }).build();

	// Make the API call
	const response = await strapiClient.get<ListingResponse>(
		`/listings?${query}`,
	);

	// Map to domain type
	return response.data;
}

/**
 * Get a single listing by slug
 */
export async function getListingBySlug(slug: string): Promise<Listing> {
	// Build query using the static helper
	const query = StrapiQueryBuilder.forListingBySlug(slug).build();

	// Make the API call
	const response = await strapiClient.get<ListingResponse>(
		`/listings?${query}`,
	);

	// Verify we have data
	if (
		!response.data ||
		!Array.isArray(response.data) ||
		response.data.length === 0
	) {
		throw new Error(`Listing with slug '${slug}' not found`);
	}

	// Map to domain type
	return response.data[0];
}

/**
 * Create a new listing
 */
export async function createListing(data: Partial<Listing>): Promise<Listing> {
	// Transform domain type to  format if needed
	// This would need more work in a real implementation
	const response = await strapiClient.post<SingleListingResponse>(
		"/listings",
		data,
	);

	// Map response back to domain type
	return response.data;
}

/**
 * Update an existing listing
 */
export async function updateListing(
	id: string | number,
	data: Partial<Listing>,
): Promise<Listing> {
	// Transform domain type to  format if needed
	// Fixed to use the direct path rather than appending the ID in the client
	const response = await strapiClient.put<SingleListingResponse>(
		`/listings/${id}`,
		data,
	);

	// Map response back to domain type
	return response.data;
}

/**
 * Delete a listing
 */
export async function deleteListing(id: string | number): Promise<void> {
	await strapiClient.delete("/listings", id);
}
