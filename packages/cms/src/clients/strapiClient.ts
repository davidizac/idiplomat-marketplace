/**
 * Strapi HTTP Client
 * Handles low-level HTTP requests to the Strapi API
 */

// Define Strapi API URL and token - server-side only
const STRAPI_URL =
	process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";
const STRAPI_TOKEN =
	process.env.STRAPI_TOKEN ??
	"fdeeddbf6f22beb0b52ef6925226f2c94a0703eeec281a63a2d75f124ff05e8d5280e24e7df4902755c3a5f5de6c17f440f3983d2ad185e997c5eb82d8bd288ff45c52eca3bd09e80ee6e48799fd7ec26e52c7e7c33266376fdfa403eeb0d2ada86e85fd082bfe7bc4f86a54ac775cb0e145d24675aae53bd3d862c4d842f955";

interface RequestOptions extends Omit<RequestInit, "body"> {
	body?: any;
}

/**
 * Core fetch function for Strapi API
 */
export async function strapiRequest<T = any>(
	path: string,
	options?: RequestOptions,
): Promise<T> {
	const url = new URL(`${STRAPI_URL}/api${path}`);
	const headers = new Headers(options?.headers);

	// Set authorization header for server-side requests
	headers.set("Authorization", `Bearer ${STRAPI_TOKEN}`);

	// Set content type for POST/PUT requests
	if (options?.method === "POST" || options?.method === "PUT") {
		headers.set("Content-Type", "application/json");
	}

	// Prepare request body if provided
	let body = options?.body;
	if (body && typeof body === "object") {
		body = JSON.stringify(body);
	}

	const response = await fetch(url.toString(), {
		...options,
		headers,
		body,
	});

	if (!response.ok) {
		// Enhanced error handling
		const errorText = await response.text().catch(() => "Unknown error");
		throw new Error(
			`Strapi API error: ${response.status} ${response.statusText} - ${errorText}`,
		);
	}

	return response.json();
}

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
 * Strapi client with HTTP methods
 */
export const strapiClient = {
	/**
	 * GET request to Strapi API
	 */
	get: <T = any>(path: string, options?: RequestOptions): Promise<T> => {
		return strapiRequest<T>(path, {
			...options,
			method: "GET",
		});
	},

	/**
	 * POST request to Strapi API
	 */
	post: <T = any>(
		path: string,
		data: any,
		options?: RequestOptions,
	): Promise<T> => {
		return strapiRequest<T>(path, {
			...options,
			method: "POST",
			body: { data },
		});
	},

	/**
	 * PUT request to Strapi API
	 */
	put: <T = any>(
		path: string,
		data: any,
		options?: RequestOptions,
	): Promise<T> => {
		// Support both direct path (/listings/123) and separate id
		return strapiRequest<T>(path, {
			...options,
			method: "PUT",
			body: { data },
		});
	},

	/**
	 * DELETE request to Strapi API
	 */
	delete: <T = any>(
		path: string,
		id: string | number,
		options?: RequestOptions,
	): Promise<T> => {
		return strapiRequest<T>(`${path}/${id}`, {
			...options,
			method: "DELETE",
		});
	},
};
