/**
 * Typed wrapper for Strapi REST API
 */

// Define Strapi API URL and token
const STRAPI_URL =
	process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";
const STRAPI_TOKEN =
	process.env.NEXT_PUBLIC_STRAPI_TOKEN ??
	// If no token is provided, use the provided token
	"fdeeddbf6f22beb0b52ef6925226f2c94a0703eeec281a63a2d75f124ff05e8d5280e24e7df4902755c3a5f5de6c17f440f3983d2ad185e997c5eb82d8bd288ff45c52eca3bd09e80ee6e48799fd7ec26e52c7e7c33266376fdfa403eeb0d2ada86e85fd082bfe7bc4f86a54ac775cb0e145d24675aae53bd3d862c4d842f955";

// Helper to build Strapi URLs
export function buildStrapiURL(
	path: string,
	queryParams?: Record<string, string>,
): URL {
	const url = new URL(`${STRAPI_URL}/api${path}`);

	if (queryParams) {
		Object.entries(queryParams).forEach(([key, value]) => {
			url.searchParams.append(key, value);
		});
	}

	return url;
}

// Basic fetch function for Strapi
export async function strapiFetch<T = any>(
	path: string,
	options?: RequestInit,
): Promise<T> {
	const headers = new Headers(options?.headers);
	headers.set("Authorization", `Bearer ${STRAPI_TOKEN}`);

	// Always ensure Content-Type is set for POST/PUT requests
	if (options?.method === "POST" || options?.method === "PUT") {
		headers.set("Content-Type", "application/json");
	}

	const response = await fetch(buildStrapiURL(path), {
		...options,
		headers,
	});

	if (!response.ok) {
		// Better error handling
		const errorText = await response.text().catch(() => "Unknown error");
		throw new Error(
			`Strapi API error: ${response.status} ${response.statusText} - ${errorText}`,
		);
	}

	return response.json();
}

// Strapi response types
export interface StrapiPagination {
	page: number;
	pageSize: number;
	pageCount: number;
	total: number;
}

export interface StrapiResponse<T> {
	data: T;
	meta: {
		pagination?: StrapiPagination;
	};
}

// Helper to get full image URL from Strapi
export function getStrapiImageUrl(url: string | null | undefined): string {
	if (!url) return "";

	// If it's already a full URL, return it
	if (url.startsWith("http")) return url;

	return `${STRAPI_URL}${url}`;
}

// Fetcher for getting data with pagination and filters
export async function getStrapiEntities<T>(
	path: string,
	{
		page = 1,
		pageSize = 25,
		sort = "createdAt:desc",
		filters = {},
		populate = "*",
	}: {
		page?: number;
		pageSize?: number;
		sort?: string;
		filters?: Record<string, any>;
		populate?: string | string[] | Record<string, any>;
	} = {},
): Promise<StrapiResponse<T>> {
	const queryParams: Record<string, string> = {
		"pagination[page]": String(page),
		"pagination[pageSize]": String(pageSize),
		sort,
	};

	// Handle populate parameter
	if (typeof populate === "string") {
		queryParams.populate = populate;
	} else if (Array.isArray(populate)) {
		populate.forEach((field) => {
			queryParams[`populate[${field}]`] = "true";
		});
	} else if (typeof populate === "object") {
		Object.entries(populate).forEach(([key, value]) => {
			queryParams[`populate[${key}]`] = String(value);
		});
	}

	// Handle filters
	if (Object.keys(filters).length > 0) {
		queryParams.filters = JSON.stringify(filters);
	}

	const queryString = new URLSearchParams(queryParams).toString();
	return strapiFetch<StrapiResponse<T>>(`${path}?${queryString}`);
}

// Helper to format data for Strapi POST/PUT
export function formatStrapiData<T>(data: T): { data: T } {
	return { data };
}

// Create a new entity using Strapi
export async function createStrapiEntity<T, R = any>(
	path: string,
	data: T,
): Promise<R> {
	return strapiFetch<R>(path, {
		method: "POST",
		body: JSON.stringify(formatStrapiData(data)),
	});
}

// Update an existing entity using Strapi
export async function updateStrapiEntity<T, R = any>(
	path: string,
	id: string | number,
	data: T,
): Promise<R> {
	return strapiFetch<R>(`${path}/${id}`, {
		method: "PUT",
		body: JSON.stringify(formatStrapiData(data)),
	});
}

// Delete an entity using Strapi
export async function deleteStrapiEntity<R = any>(
	path: string,
	id: string | number,
): Promise<R> {
	return strapiFetch<R>(`${path}/${id}`, {
		method: "DELETE",
	});
}
