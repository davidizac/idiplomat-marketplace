"use client";

import { useLocaleRouter } from "@i18n/routing";
import { getStrapiImageUrl } from "@repo/cms";
import { Button } from "@ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@ui/components/dialog";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { type Category, useCategories } from "../../api";

interface CategorySelectionModalProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	searchQuery?: string | null;
}

export function CategorySelectionModal({
	isOpen,
	onOpenChange,
	searchQuery,
}: CategorySelectionModalProps) {
	const router = useLocaleRouter();
	const searchParams = useSearchParams();
	const { data: categoriesResponse, isLoading } = useCategories({
		pageSize: 8, // Get only top categories for the modal
	});

	// Filter root categories (those without a parent)
	const rootCategories =
		categoriesResponse?.data?.filter(
			(category: Category) => !category.parent,
		) || [];

	const handleCategorySelect = (categorySlug: string) => {
		// Preserve all existing URL parameters and add/update the category
		const params = new URLSearchParams(searchParams.toString());
		params.set("category", categorySlug);
		params.delete("subcategory"); // Clear subcategory when category changes

		// Use replace instead of push to force a page refresh
		router.replace(`/listings?${params.toString()}`);
		onOpenChange(false);
	};

	const handleViewAllCategories = () => {
		router.push("/categories");
		onOpenChange(false);
	};

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-3xl">
				<DialogHeader>
					<DialogTitle className="text-2xl">
						Choose a Category
					</DialogTitle>
					<DialogDescription>
						{searchQuery
							? `Please select a category to search for "${searchQuery}"`
							: "Select a category to browse listings"}
					</DialogDescription>
				</DialogHeader>

				{isLoading ? (
					<div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4">
						{Array.from({ length: 8 }).map((_, i) => (
							<div
								key={i}
								className="animate-pulse bg-muted rounded-lg aspect-square"
							/>
						))}
					</div>
				) : (
					<>
						<div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4">
							{rootCategories.map((category: Category) => (
								<button
									key={category.id}
									type="button"
									className="rounded-lg overflow-hidden border-2 border-transparent hover:border-primary/30 cursor-pointer transition-all w-full text-left"
									onClick={() =>
										handleCategorySelect(category.slug)
									}
									aria-label={`Select ${category.name} category`}
								>
									<div className="aspect-square relative flex items-center justify-center">
										{category.icon ? (
											<Image
												src={getStrapiImageUrl(
													category.icon.url,
												)}
												alt={category.name}
												width={64}
												height={64}
												className="object-cover rounded-md"
												sizes="64px"
											/>
										) : (
											<div className="w-full h-full bg-muted flex items-center justify-center">
												<span className="text-2xl">
													🏷️
												</span>
											</div>
										)}
										<div className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/5" />
									</div>
									<div className="p-2 text-center font-medium">
										{category.name}
									</div>
								</button>
							))}
						</div>

						<div className="flex justify-start mt-4">
							<Button
								variant="outline"
								onClick={handleViewAllCategories}
							>
								View All Categories
							</Button>
						</div>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}
