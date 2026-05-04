/**
 * Strapi Client
 * Uses the official @strapi/client library to interact with Strapi API
 */

import { strapi } from "@strapi/client";

// Define Strapi API URL and token - server-side only
const STRAPI_URL =
	process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";
const STRAPI_API_URL = `${STRAPI_URL}/api`;
const STRAPI_TOKEN = process.env.STRAPI_TOKEN ?? "";

type StrapiClient = ReturnType<typeof strapi>;

let strapiClientInstance: StrapiClient | null = null;

function getStrapiToken(): string {
	if (!STRAPI_TOKEN) {
		throw new Error("STRAPI_TOKEN is required for Strapi API requests");
	}

	return STRAPI_TOKEN;
}

function getStrapiClient(): StrapiClient {
	if (!strapiClientInstance) {
		strapiClientInstance = strapi({
			baseURL: STRAPI_API_URL,
			auth: getStrapiToken(),
		});
	}

	return strapiClientInstance;
}

/**
 * Lazily initialize the Strapi client with authentication.
 */
export const strapiClient = new Proxy({} as StrapiClient, {
	get(_target, property, receiver) {
		return Reflect.get(getStrapiClient(), property, receiver);
	},
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
	listings: () => getStrapiClient().collection("listings"),
	categories: () => getStrapiClient().collection("categories"),
	tags: () => getStrapiClient().collection("tags"),
	productAttributeValues: () =>
		getStrapiClient().collection("product-attribute-values"),
	// Helper method to get any collection by name
	collection: (name: string) => getStrapiClient().collection(name),
};

export const strapiSingles = {
	homepage: () => getStrapiClient().single("homepage"),
	globalSettings: () => getStrapiClient().single("global-setting"),
};

/**
 * Export the files manager
 */
export const strapiFiles = new Proxy({} as StrapiClient["files"], {
	get(_target, property, receiver) {
		return Reflect.get(getStrapiClient().files, property, receiver);
	},
});

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
			Authorization: `Bearer ${getStrapiToken()}`,
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
