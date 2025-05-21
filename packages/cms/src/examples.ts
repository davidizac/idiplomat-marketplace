/**
 * Example usage of CMS services
 * This file demonstrates how to use the service classes with relations
 */

import {
	categoryService,
	listingService,
	strapiCollections,
	strapiFiles,
	strapiSingles,
} from "./index";

/**
 * Example: Create a complete listing with categories and attributes
 */
async function createCompleteProductExample() {
	// 1. First, get some categories to assign to the listing
	const categories = await categoryService.getCategories({
		pageSize: 5,
	});
	const categoryIds = categories.data.map((c) => c.id.toString());

	// 2. Upload product images (this would normally come from a file upload)
	// For this example, we'll assume images were already uploaded and we have IDs
	const imageIds = ["1", "2"];

	// 3. Create the listing with relations
	const newListing = await listingService.createListing({
		title: "MacBook Pro M3 Max",
		description: "Professional laptop with 32GB RAM and 1TB SSD",
		slug: "macbook-pro-m3-max",
		images: imageIds,
		categories: categoryIds.slice(0, 2), // Assign first two categories
		attributeValues: [
			{ attributeDocumentId: "1", value: "Apple" }, // Brand
			{ attributeDocumentId: "2", value: "Space Gray" }, // Color
			{ attributeDocumentId: "3", value: "16 inch" }, // Size
		],
	});

	console.log("Created listing with relations:", newListing);
	return newListing;
}

/**
 * Example: Create a category with attributes and subcategories
 */
async function createCategoryHierarchyExample() {
	// 1. Create a parent category
	const parentCategory = await categoryService.createCategory({
		name: "Electronics",
		slug: "electronics",
		description: "Electronic devices and accessories",
	});

	// 2. Create a subcategory with attributes
	const subcategory = await categoryService.createCategory({
		name: "Computers",
		slug: "computers",
		description: "Desktops, laptops and accessories",
		parentId: parentCategory.id.toString(),
		attributeDocumentIds: ["1", "2", "3"], // Assume these attribute IDs exist
	});

	console.log("Created category hierarchy:", {
		parent: parentCategory,
		child: subcategory,
	});
}

/**
 * Example: Update a listing with new relations
 */
async function updateListingWithRelationsExample(listingDocumentId: string) {
	// 1. First, get the existing listing
	const existingListing =
		await listingService.getListingById(listingDocumentId);
	console.log("Existing listing:", existingListing);

	// 2. Update with new relations
	const updatedListing = await listingService.updateListing(
		listingDocumentId,
		{
			price: 3299.99, // Updated price
			status: "on_sale", // Updated status
			// Add a new category (assume this ID exists)
			categories: [
				...existingListing.categories.map((c) => c.id.toString()),
				"10",
			],
			// Replace all attribute values
			attributeValues: [
				{ attributeDocumentId: "1", value: "Apple" },
				{ attributeDocumentId: "2", value: "Silver" }, // Changed color
				{ attributeDocumentId: "3", value: "16 inch" },
				{ attributeDocumentId: "4", value: "32GB" }, // Added RAM
			],
		},
	);

	console.log("Updated listing with new relations:", updatedListing);
}

/**
 * Example: Search for listings by attributes
 */
async function searchListingsByAttributesExample() {
	const listings = await listingService.getListings({
		page: 1,
		pageSize: 10,
		attributeFilters: [
			{ attribute: "Color", value: "Silver" },
			{ attribute: "Brand", value: "Apple" },
		],
	});

	console.log(
		`Found ${listings.data.length} listings with the specified attributes`,
	);
	return listings;
}

/**
 * Example: Using the basic Strapi client directly
 */
async function usingStrapiClientDirectlyExample() {
	// Get listings using the collection manager
	const listings = await strapiCollections.listings().find({
		filters: {
			price: { $gt: 1000 },
		},
		sort: ["price:desc"],
		populate: "*",
	});

	// Get homepage from single type
	const homepage = await strapiSingles.homepage().find({
		populate: "*",
	});

	// Get media files - using simple approach without checking response properties
	try {
		await strapiFiles.find({
			filters: {
				name: { $contains: "product" },
			},
		});

		console.log("Direct client results:", {
			listingsCount: listings.data.length,
			homepage: homepage.data,
			// Skip showing the count of images to avoid type issues
		});
	} catch (error) {
		console.error("Error fetching files:", error);
	}
}

// Export examples for reference
export const examples = {
	createCompleteProductExample,
	createCategoryHierarchyExample,
	updateListingWithRelationsExample,
	searchListingsByAttributesExample,
	usingStrapiClientDirectlyExample,
};
