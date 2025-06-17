import { getListings, getStrapiImageUrl } from "@repo/cms";
import { notFound } from "next/navigation";
import { loadCategoryBySlug } from "../loader";

export default async function CategoryPage({ params }: any) {
	// Load category by slug
	const category = await loadCategoryBySlug(params.slug);

	// Handle category not found
	if (!category) {
		notFound();
	}

	// Load listings for this category
	const { data: listings } = await getListings({
		subCategories: [category.slug],
		page: 1,
		pageSize: 12,
	});

	return (
		<div className="container py-12">
			<h1 className="text-3xl font-bold mb-2">{category.name}</h1>

			{category.description && (
				<p className="text-muted-foreground mb-8">
					{category.description}
				</p>
			)}

			{/* Parent category link if available */}
			{category.parent && (
				<div className="mb-6">
					<p className="text-sm">
						<span className="text-muted-foreground">
							Category:{" "}
						</span>
						<a
							href={`/${params.locale}/categories/${category.parent.slug}`}
							className="text-primary hover:underline"
						>
							{category.parent.name}
						</a>
						{" › "}
						<span className="font-medium">{category.name}</span>
					</p>
				</div>
			)}

			{/* Listings in this category */}
			<div className="mt-8">
				<h2 className="text-2xl font-semibold mb-6">
					Listings in {category.name}
				</h2>

				{listings.length === 0 ? (
					<div className="p-12 text-center border rounded-lg bg-muted/20">
						<p className="text-muted-foreground">
							No listings found in this category.
						</p>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
						{listings.map((listing) => (
							<div
								key={listing.id}
								className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
							>
								<a
									href={`/${params.locale}/listings/${listing.id}`}
								>
									{/* Listing image */}
									<div className="aspect-square relative bg-muted">
										{listing.images.length > 0 && (
											<img
												src={getStrapiImageUrl(
													listing.images[0].url,
												)}
												alt={listing.title}
												className="w-full h-full object-cover"
											/>
										)}
									</div>

									{/* Listing details */}
									<div className="p-4">
										<h3 className="font-semibold truncate">
											{listing.title}
										</h3>
										<p className="mt-1 font-bold text-primary">
											${listing.price}
										</p>
										<p className="mt-1 text-sm text-muted-foreground">
											{listing.address}
										</p>
									</div>
								</a>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
