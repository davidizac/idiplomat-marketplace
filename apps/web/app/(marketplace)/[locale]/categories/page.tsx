import Link from "next/link";
import { listingService } from "@repo/cms";
import type { Category } from "../../../../modules/marketplace/api";
import {
	categoriesWithListings,
	occupiedCategorySlugs,
} from "../../../../modules/marketplace/listings/lib/categories";
import { loadRootCategories } from "./loader";

export default async function CategoriesPage({ params }: any) {
	const { locale } = await params;

	const [{ data: rootCategories }, listingsResult] = await Promise.all([
		loadRootCategories({
			page: 1,
			pageSize: 100,
			sort: "name:asc",
		}),
		listingService.getListings({ pageSize: 100 }),
	]);

	const visibleCategories = categoriesWithListings(
		rootCategories,
		occupiedCategorySlugs(listingsResult.data),
	);

	return (
		<div className="container py-12">
			<h1 className="text-3xl font-bold mb-6">Categories</h1>

			{visibleCategories.length === 0 ? (
				<p className="text-muted-foreground">
					No categories have listings yet.
				</p>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{visibleCategories.map((category) => (
						<CategoryCard
							key={category.id}
							category={category}
							locale={locale}
						/>
					))}
				</div>
			)}
		</div>
	);
}

function CategoryCard({
	category,
	locale,
}: { category: Category; locale: string }) {
	return (
		<Link
			href={`/${locale}/categories/${category.slug}`}
			className="block p-6 border rounded-lg hover:shadow-md transition-shadow"
		>
			<h2 className="text-xl font-semibold mb-2">{category.name}</h2>

			{category.description && (
				<p className="text-muted-foreground text-sm line-clamp-2">
					{category.description}
				</p>
			)}
		</Link>
	);
}
