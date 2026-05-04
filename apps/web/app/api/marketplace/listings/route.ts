import { listingService } from "@repo/cms";
import type { ListingFilterParams } from "@repo/cms/types";
import { NextResponse, type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

function parsePositiveNumber(value: string | null): number | undefined {
	if (!value) {
		return undefined;
	}

	const parsed = Number.parseInt(value, 10);
	return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function parseAttributeFilters(
	value: string | null,
): ListingFilterParams["attributeFilters"] {
	if (!value) {
		return undefined;
	}

	try {
		const parsed = JSON.parse(value);
		return Array.isArray(parsed) ? parsed : undefined;
	} catch {
		return undefined;
	}
}

export async function GET(request: NextRequest) {
	const searchParams = request.nextUrl.searchParams;
	const subCategories = searchParams.getAll("subCategories");
	const author = searchParams.get("author");

	const params: ListingFilterParams = {
		page: parsePositiveNumber(searchParams.get("page")),
		pageSize: parsePositiveNumber(searchParams.get("pageSize")),
		sort: searchParams.get("sort") || undefined,
		search: searchParams.get("search") || undefined,
		address: searchParams.get("address") || undefined,
		category: searchParams.get("category") || undefined,
		author: author === null ? undefined : author,
		subCategories:
			subCategories.length > 0 ? subCategories : undefined,
		attributeFilters: parseAttributeFilters(
			searchParams.get("attributeFilters"),
		),
	};

	try {
		const listings = await listingService.getListings(params);
		return NextResponse.json(listings);
	} catch (error) {
		console.error("Failed to fetch marketplace listings", error);
		return NextResponse.json(
			{ error: "Failed to fetch marketplace listings" },
			{ status: 502 },
		);
	}
}
