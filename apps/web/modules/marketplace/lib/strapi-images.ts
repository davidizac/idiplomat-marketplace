const STRAPI_BASE_URL =
	process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";

export function getMarketplaceImageUrl(
	url: string | null | undefined,
): string {
	if (!url) {
		return "";
	}

	if (url.startsWith("http")) {
		return url;
	}

	return `${STRAPI_BASE_URL.replace(/\/$/, "")}${url}`;
}
