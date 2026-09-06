export function isListingOwner(
	listing: { author?: string | null },
	userId?: string | null,
): boolean {
	return Boolean(userId && listing.author && listing.author === userId);
}
