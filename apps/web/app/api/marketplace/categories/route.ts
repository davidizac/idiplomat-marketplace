import { categoryService } from "@repo/cms";
import { NextResponse, type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

function parsePositiveNumber(value: string | null): number | undefined {
	if (!value) {
		return undefined;
	}

	const parsed = Number.parseInt(value, 10);
	return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

export async function GET(request: NextRequest) {
	const searchParams = request.nextUrl.searchParams;
	const slug = searchParams.get("slug");

	try {
		if (slug) {
			const category = await categoryService.getCategoryBySlug(slug);
			return NextResponse.json(category);
		}

		const categories = await categoryService.getCategories({
			page: parsePositiveNumber(searchParams.get("page")),
			pageSize: parsePositiveNumber(searchParams.get("pageSize")),
			sort: searchParams.get("sort") || undefined,
			populate: searchParams.getAll("populate"),
		});

		return NextResponse.json(categories);
	} catch (error) {
		console.error("Failed to fetch marketplace categories", error);
		return NextResponse.json(
			{ error: "Failed to fetch marketplace categories" },
			{ status: 502 },
		);
	}
}
