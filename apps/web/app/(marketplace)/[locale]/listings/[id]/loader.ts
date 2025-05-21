/**
 * Listing Detail Page Loader
 * Server-side data loading for the listing detail page
 */

import { type Listing, listingService } from "@repo/cms";

/**
 * Load a listing by ID with error handling
 */
export async function loadListing(documentId: string): Promise<Listing> {
	return listingService.getListingById(documentId);
}
