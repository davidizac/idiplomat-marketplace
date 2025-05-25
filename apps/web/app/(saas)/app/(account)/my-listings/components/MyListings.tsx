"use client";

import { getStrapiImageUrl, listingService } from "@repo/cms";
import type { Listing } from "@repo/cms";
import { Pagination } from "@saas/shared/components/Pagination";
import { Badge } from "@ui/components/badge";
import { Button } from "@ui/components/button";
import { Card } from "@ui/components/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ui/components/tabs";
import { cn } from "@ui/lib";
import {
	CalendarIcon,
	Edit2Icon,
	ImageIcon,
	MapPinIcon,
	PlusIcon,
	TagIcon,
	Trash2Icon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

interface MyListingsProps {
	userId: string;
}

export default function MyListings({ userId }: MyListingsProps) {
	const t = useTranslations();
	const [activeTab, setActiveTab] = useState<string>("active");
	const [listings, setListings] = useState<Listing[]>([]);
	const [loading, setLoading] = useState(true);
	const [currentPage, setCurrentPage] = useState(1);
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const itemsPerPage = 6;

	useEffect(() => {
		fetchListings();
	}, [userId]);

	const fetchListings = async () => {
		try {
			setLoading(true);
			// TODO: Filter by userId when backend supports it
			const response = await listingService.getListings({
				pageSize: 100, // Get all user listings
			});
			setListings(response.data);
		} catch (error) {
			console.error("Failed to fetch listings:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (documentId: string) => {
		if (!confirm(t("listings.confirmDelete"))) {
			return;
		}

		try {
			setDeletingId(documentId);
			await listingService.deleteListing(documentId);
			await fetchListings();
		} catch (error) {
			console.error("Failed to delete listing:", error);
			alert(t("listings.deleteFailed"));
		} finally {
			setDeletingId(null);
		}
	};

	const getStatusBadge = (status: string) => {
		const variants: Record<
			string,
			"default" | "secondary" | "destructive" | "outline"
		> = {
			ACTIVE: "default",
			DRAFT: "secondary",
			SOLD: "outline",
			ARCHIVED: "destructive",
		};

		const colors: Record<string, string> = {
			ACTIVE: "text-green-600 bg-green-50 border-green-200",
			DRAFT: "text-yellow-600 bg-yellow-50 border-yellow-200",
			SOLD: "text-gray-600 bg-gray-50 border-gray-200",
			ARCHIVED: "text-red-600 bg-red-50 border-red-200",
		};

		return (
			<Badge
				variant={variants[status] || "default"}
				className={cn("capitalize", colors[status])}
			>
				{status.toLowerCase()}
			</Badge>
		);
	};

	const filteredListings = listings.filter((listing) => {
		if (activeTab === "active") return listing.status === "ACTIVE";
		if (activeTab === "sold") return listing.status === "SOLD";
		if (activeTab === "drafts") return listing.status === "DRAFT";
		if (activeTab === "archived") return listing.status === "ARCHIVED";
		return true; // "all" tab
	});

	// Calculate pagination
	const pageCount = Math.ceil(filteredListings.length / itemsPerPage);
	const paginatedListings = filteredListings.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage,
	);

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h2 className="text-xl font-medium">
					{t("myListings.yourListings")}
				</h2>
				<Link href="/create-listing">
					<Button>
						<PlusIcon className="mr-2 h-4 w-4" />
						{t("myListings.createNew")}
					</Button>
				</Link>
			</div>

			<Tabs
				value={activeTab}
				onValueChange={setActiveTab}
				className="w-full"
			>
				<TabsList className="grid grid-cols-5 mb-8">
					<TabsTrigger value="all">
						{t("myListings.tabs.all")}
					</TabsTrigger>
					<TabsTrigger value="active">
						{t("myListings.tabs.active")}
					</TabsTrigger>
					<TabsTrigger value="sold">
						{t("myListings.tabs.sold")}
					</TabsTrigger>
					<TabsTrigger value="drafts">
						{t("myListings.tabs.drafts")}
					</TabsTrigger>
					<TabsTrigger value="archived">
						{t("myListings.tabs.archived")}
					</TabsTrigger>
				</TabsList>

				{/* All tabs share the same content section */}
				<TabsContent value={activeTab} className="mt-0">
					{loading ? (
						<div className="flex items-center justify-center py-8">
							<p className="text-muted-foreground">
								{t("common.loading")}
							</p>
						</div>
					) : paginatedListings.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-12 text-center">
							<TagIcon className="h-12 w-12 text-muted-foreground/20 mb-4" />
							<p className="text-muted-foreground mb-4">
								{activeTab === "all"
									? t("listings.noListings")
									: t("listings.noListingsInCategory")}
							</p>
							<Link href="/create-listing">
								<Button>
									<PlusIcon className="mr-2 h-4 w-4" />
									{t("listings.createFirst")}
								</Button>
							</Link>
						</div>
					) : (
						<>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
								{paginatedListings.map((listing) => (
									<Card
										key={listing.id}
										className="overflow-hidden"
									>
										<div className="relative h-48 w-full bg-muted">
											{listing.images?.[0] ? (
												<Image
													src={getStrapiImageUrl(
														listing.images[0].url,
													)}
													alt={listing.title}
													fill
													className="object-cover"
												/>
											) : (
												<div className="flex h-full items-center justify-center">
													<ImageIcon className="h-12 w-12 text-muted-foreground/20" />
												</div>
											)}
										</div>
										<div className="p-4 space-y-3">
											<div className="flex justify-between items-start">
												<h3 className="font-medium line-clamp-2">
													{listing.title}
												</h3>
												{listing.price && (
													<p className="font-semibold">
														${listing.price}
													</p>
												)}
											</div>

											<div className="flex items-center justify-between">
												{getStatusBadge(listing.status)}
												{listing.categories?.[0] && (
													<span className="text-xs text-muted-foreground">
														{
															listing
																.categories[0]
																.name
														}
													</span>
												)}
											</div>

											<div className="flex items-center gap-4 text-xs text-muted-foreground">
												{listing.location && (
													<span className="flex items-center gap-1">
														<MapPinIcon className="h-3 w-3" />
														{listing.location}
													</span>
												)}
												<span className="flex items-center gap-1">
													<CalendarIcon className="h-3 w-3" />
													{new Date(
														listing.createdAt,
													).toLocaleDateString()}
												</span>
											</div>

											<div className="flex justify-between items-center pt-2">
												<Link
													href={`/edit-listing/${listing.documentId}`}
												>
													<Button
														variant="outline"
														size="sm"
													>
														<Edit2Icon className="h-4 w-4 mr-1" />
														{t("myListings.edit")}
													</Button>
												</Link>
												<Button
													variant="ghost"
													size="sm"
													onClick={() =>
														handleDelete(
															listing.documentId,
														)
													}
													disabled={
														deletingId ===
														listing.documentId
													}
												>
													<Trash2Icon className="h-4 w-4 text-destructive" />
												</Button>
											</div>
										</div>
									</Card>
								))}
							</div>

							{pageCount > 1 && (
								<div className="mt-8 flex justify-center">
									<Pagination
										currentPage={currentPage}
										totalItems={filteredListings.length}
										itemsPerPage={itemsPerPage}
										onChangeCurrentPage={setCurrentPage}
									/>
								</div>
							)}
						</>
					)}
				</TabsContent>
			</Tabs>
		</div>
	);
}
