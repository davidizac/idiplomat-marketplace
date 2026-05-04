/**
 * Strapi Client
 * Uses the official @strapi/client library to interact with Strapi API
 */

import { strapi } from "@strapi/client";

// Define Strapi API URL and token - server-side only
const STRAPI_URL =
	process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";
const STRAPI_API_URL = `${STRAPI_URL}/api`;
const STRAPI_TOKEN =
	process.env.STRAPI_TOKEN ??
	"57e6cc69828d7b4fdbf87fe5c982edf380eee0269b3136217250745b867c9c1661ef9ec52d190d48e14f2e888cbfcb16d6501aa5c1a5a50f635b6248fe111035f0a3dab2cdb5ded6438bfcf9d987299e7d4101792a21f848bb64325b46b995f6015aed976b7f4b4be7d64fb30cc00aa0b838155012fcdab34f96c5dd15cc3b0f";

/**
 * Initialize the Strapi client with authentication
 */
export const strapiClient = strapi({
	baseURL: STRAPI_API_URL,
	auth: STRAPI_TOKEN,
});

/**
 * Helper to get full image URL from Strapi
 */
export function getStrapiImageUrl(url: string | null | undefined): string {
	if (!url) return "";

	// If it's already a full URL, return it
	if (url.startsWith("http")) return url;

	return `${STRAPI_URL}${url}`;
}

/**
 * Type-safe helpers for collections and singles
 */
export const strapiCollections = {
	listings: () => strapiClient.collection("listings"),
	categories: () => strapiClient.collection("categories"),
	tags: () => strapiClient.collection("tags"),
	productAttributeValues: () =>
		strapiClient.collection("product-attribute-values"),
	// Helper method to get any collection by name
	collection: (name: string) => strapiClient.collection(name),
};

export const strapiSingles = {
	homepage: () => strapiClient.single("homepage"),
	globalSettings: () => strapiClient.single("global-setting"),
};

/**
 * Export the files manager
 */
export const strapiFiles = strapiClient.files;

/**
 * Upload one or more files to Strapi Media Library (Upload plugin)
 * Returns an array of uploaded file IDs.
 *
 * Note: This helper is intended for server-side use only.
 */
export async function uploadFiles(
	files: Array<{ data: Blob | Buffer | File; filename?: string }>,
): Promise<number[]> {
	if (!files || files.length === 0) return [];

	const formData = new FormData();

	files.forEach((file, idx) => {
		const fileName = file.filename ?? `file-${idx}`;
		// @ts-ignore - Node 18+ FormData accepts Buffer | Blob | File
		formData.append("files", file.data, fileName);
	});

	const response = await fetch(`${STRAPI_URL}/api/upload`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${STRAPI_TOKEN}`,
			// Content-Type will be set automatically by fetch when using FormData
		},
		body: formData,
	});

	if (!response.ok) {
		const msg = await response.text().catch(() => response.statusText);
		throw new Error(`Failed to upload files: ${response.status} ${msg}`);
	}

	const json = await response.json();
	// Strapi returns an array of uploaded file objects
	return Array.isArray(json) ? json.map((f: any) => f.id as number) : [];
}
