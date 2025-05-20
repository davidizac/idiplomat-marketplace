// "use client";
import Link from "next/link";
import type { Category } from "../../../../modules/marketplace/api";
import { loadRootCategories } from "./loader";

interface CategoriesPageProps {
	params: {
		locale: string;
	};
	searchParams: {
		page?: string;
		pageSize?: string;
	};
}

export default async function CategoriesPage({
	params,
	searchParams,
}: CategoriesPageProps) {
	// Parse pagination params
	const page = Number.parseInt(searchParams.page || "1", 10);
	const pageSize = Number.parseInt(searchParams.pageSize || "20", 10);

	// Load root categories
	const { data: rootCategories, pagination } = await loadRootCategories({
		page,
		pageSize,
		sort: "name:asc",
	});

	return (
		<div className="container py-12">
			<h1 className="text-3xl font-bold mb-6">Categories</h1>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{rootCategories.map((category) => (
					<CategoryCard
						key={category.id}
						category={category}
						locale={params.locale}
					/>
				))}
			</div>

			{/* Pagination */}
			{pagination.pageCount > 1 && (
				<div className="mt-12 flex justify-center">
					<nav className="flex items-center space-x-2">
						{page > 1 && (
							<Link
								href={`/${params.locale}/categories?page=${page - 1}&pageSize=${pageSize}`}
								className="px-4 py-2 border rounded hover:bg-muted transition-colors"
							>
								Previous
							</Link>
						)}

						<span className="px-4 py-2">
							Page {page} of {pagination.pageCount}
						</span>

						{page < pagination.pageCount && (
							<Link
								href={`/${params.locale}/categories?page=${page + 1}&pageSize=${pageSize}`}
								className="px-4 py-2 border rounded hover:bg-muted transition-colors"
							>
								Next
							</Link>
						)}
					</nav>
				</div>
			)}
		</div>
	);
}

// Individual category card component
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
