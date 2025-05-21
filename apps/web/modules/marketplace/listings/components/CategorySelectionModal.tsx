"use client";

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
import { useRouter } from "next/navigation";
import { useState } from "react";
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
	const router = useRouter();
	const { data: categoriesResponse, isLoading } = useCategories({
		pageSize: 8, // Get only top categories for the modal
	});

	const [selectedCategorySlug, setSelectedCategorySlug] = useState<
		string | null
	>(null);

	// Filter root categories (those without a parent)
	const rootCategories =
		categoriesResponse?.data?.filter(
			(category: Category) => !category.parent,
		) || [];

	const handleCategorySelect = (categorySlug: string) => {
		setSelectedCategorySlug(categorySlug);
	};

	const handleContinue = () => {
		if (selectedCategorySlug) {
			// Build the URL with both category and search query if available
			let url = `/listings?category=${selectedCategorySlug}`;
			if (searchQuery) {
				url += `&search=${encodeURIComponent(searchQuery)}`;
			}
			// Use replace instead of push to force a page refresh
			router.replace(url);
			onOpenChange(false);
		}
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
									className={`rounded-lg overflow-hidden border-2 cursor-pointer transition-all w-full text-left ${
										selectedCategorySlug === category.slug
											? "border-primary shadow-md scale-105"
											: "border-transparent hover:border-primary/30"
									}`}
									onClick={() =>
										handleCategorySelect(category.slug)
									}
									aria-label={`Select ${category.name} category`}
								>
									<div className="aspect-square relative">
										{category.image ? (
											<Image
												src={getStrapiImageUrl(
													category.image.url,
												)}
												alt={category.name}
												fill
												className="object-cover"
												sizes="(max-width: 640px) 50vw, 25vw"
											/>
										) : (
											<div className="w-full h-full bg-muted flex items-center justify-center">
												<span className="text-2xl">
													🏷️
												</span>
											</div>
										)}
										<div
											className={`absolute inset-0 flex items-center justify-center ${
												selectedCategorySlug ===
												category.slug
													? "bg-primary/10"
													: "bg-black/0 hover:bg-black/5"
											}`}
										>
											{selectedCategorySlug ===
												category.slug && (
												<div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center">
													✓
												</div>
											)}
										</div>
									</div>
									<div className="p-2 text-center font-medium">
										{category.name}
									</div>
								</button>
							))}
						</div>

						<div className="flex gap-4 justify-between mt-4">
							<Button
								variant="outline"
								onClick={handleViewAllCategories}
							>
								View All Categories
							</Button>
							<Button
								onClick={handleContinue}
								disabled={!selectedCategorySlug}
							>
								Continue
							</Button>
						</div>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}
