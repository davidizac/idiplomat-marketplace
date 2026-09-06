import type { Category, Listing } from "@repo/cms";

export function occupiedCategorySlugs(listings: Listing[]): Set<string> {
	const slugs = new Set<string>();

	for (const listing of listings) {
		for (const category of listing.categories ?? []) {
			slugs.add(category.slug);
			if (category.parent?.slug) {
				slugs.add(category.parent.slug);
			}
		}
	}

	return slugs;
}

export function categoriesWithListings(
	categories: Category[],
	occupied: Set<string>,
	selectedSlug?: string | null,
): Category[] {
	return categories.filter(
		(category) =>
			occupied.has(category.slug) || category.slug === selectedSlug,
	);
}
