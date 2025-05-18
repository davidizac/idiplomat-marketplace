"use client";

import { Pagination } from "@saas/shared/components/Pagination";
import { Badge } from "@ui/components/badge";
import { Button } from "@ui/components/button";
import { Card } from "@ui/components/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ui/components/tabs";
import { Pencil, PlusIcon, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

// This would come from your API or database
// Replace with actual API calls when backend is ready
type Listing = {
	id: string;
	title: string;
	price: number;
	status: "DRAFT" | "ACTIVE" | "SOLD" | "ARCHIVED";
	category: string;
	createdAt: string;
	images: string[];
};

interface MyListingsProps {
	userId: string;
}

export default function MyListings({ userId }: MyListingsProps) {
	const t = useTranslations();
	const [activeTab, setActiveTab] = useState<string>("active");
	const [listings, setListings] = useState<Listing[]>([]);
	const [loading, setLoading] = useState(true);
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 6;

	useEffect(() => {
		// Simulating API call to fetch user listings
		setLoading(true);
		setTimeout(() => {
			// This is dummy data. Replace with actual API call
			const mockListings: Listing[] = [
				{
					id: "1",
					title: "Modern Dining Table",
					price: 250,
					status: "ACTIVE",
					category: "Furniture",
					createdAt: "2023-06-15",
					images: ["/images/placeholder-listing.jpg"],
				},
				{
					id: "2",
					title: "Vintage Desk Lamp",
					price: 75,
					status: "ACTIVE",
					category: "Home Decor",
					createdAt: "2023-06-10",
					images: ["/images/placeholder-listing.jpg"],
				},
				{
					id: "3",
					title: "Leather Office Chair",
					price: 120,
					status: "SOLD",
					category: "Furniture",
					createdAt: "2023-05-22",
					images: ["/images/placeholder-listing.jpg"],
				},
				{
					id: "4",
					title: "Persian Rug (6x9)",
					price: 350,
					status: "ACTIVE",
					category: "Home Decor",
					createdAt: "2023-05-15",
					images: ["/images/placeholder-listing.jpg"],
				},
				{
					id: "5",
					title: "Bookshelf - White",
					price: 80,
					status: "DRAFT",
					category: "Furniture",
					createdAt: "2023-05-10",
					images: ["/images/placeholder-listing.jpg"],
				},
			];

			setListings(mockListings);
			setLoading(false);
		}, 1000);
	}, [userId]);

	const handleDelete = (id: string) => {
		// This would be replaced with an actual API call
		setListings(listings.filter((listing) => listing.id !== id));
		// Remove toast for now - we'll add proper notification later
		console.log("Listing deleted:", id);
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
						<div className="text-center py-8">
							<p>{t("common.loading")}</p>
						</div>
					) : paginatedListings.length === 0 ? (
						<Card className="p-8 text-center">
							<p className="text-muted-foreground mb-4">
								{t("myListings.noListings")}
							</p>
							<Link href="/create-listing">
								<Button>
									<PlusIcon className="mr-2 h-4 w-4" />
									{t("myListings.createFirst")}
								</Button>
							</Link>
						</Card>
					) : (
						<>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
								{paginatedListings.map((listing) => (
									<Card
										key={listing.id}
										className="overflow-hidden"
									>
										<div className="relative h-48 w-full">
											<Image
												src={
													listing.images[0] ||
													"/images/placeholder-listing.jpg"
												}
												alt={listing.title}
												fill
												className="object-cover"
											/>
										</div>
										<div className="p-4 space-y-2">
											<div className="flex justify-between items-start">
												<h3 className="font-medium truncate">
													{listing.title}
												</h3>
												<p className="font-semibold">
													${listing.price}
												</p>
											</div>

											<div className="flex justify-between items-center">
												<Badge
													variant={
														listing.status ===
														"ACTIVE"
															? "default"
															: listing.status ===
																	"SOLD"
																? "destructive"
																: "secondary"
													}
												>
													{listing.status}
												</Badge>
												<span className="text-xs text-muted-foreground">
													{listing.category}
												</span>
											</div>

											<div className="flex justify-between items-center pt-2">
												<Link
													href={`/edit-listing/${listing.id}`}
												>
													<Button
														variant="outline"
														size="sm"
													>
														<Pencil className="h-4 w-4 mr-1" />
														{t("myListings.edit")}
													</Button>
												</Link>
												<Button
													variant="ghost"
													size="sm"
													onClick={() =>
														handleDelete(listing.id)
													}
												>
													<Trash2 className="h-4 w-4 text-destructive" />
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
