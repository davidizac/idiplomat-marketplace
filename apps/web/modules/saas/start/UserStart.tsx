"use client";
import { getStrapiImageUrl, listingService } from "@repo/cms";
import type { Listing } from "@repo/cms";
import { Badge } from "@ui/components/badge";
import { Button } from "@ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/components/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ui/components/tabs";
import { cn } from "@ui/lib";
import {
	AlertCircleIcon,
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

interface UserStartProps {
	userId?: string;
}

export default function UserStart({ userId }: UserStartProps) {
	const t = useTranslations();
	const [listings, setListings] = useState<Listing[]>([]);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState("all");
	const [deletingId, setDeletingId] = useState<string | null>(null);

	useEffect(() => {
		fetchListings();
	}, []);

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
				{status?.toLowerCase()}
			</Badge>
		);
	};

	const filteredListings = listings.filter((listing) => {
		if (activeTab === "active") return listing.status === "ACTIVE";
		if (activeTab === "draft") return listing.status === "DRAFT";
		if (activeTab === "sold") return listing.status === "SOLD";
		return true;
	});

	const stats = {
		total: listings.length,
		active: listings.filter((l) => l.status === "ACTIVE").length,
		draft: listings.filter((l) => l.status === "DRAFT").length,
		sold: listings.filter((l) => l.status === "SOLD").length,
	};

	return (
		<div className="space-y-6">
			{/* Quick Stats */}
			<div className="grid gap-4 md:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							{t("listings.stats.total")}
						</CardTitle>
						<TagIcon className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.total}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							{t("listings.stats.active")}
						</CardTitle>
						<AlertCircleIcon className="h-4 w-4 text-green-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.active}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							{t("listings.stats.draft")}
						</CardTitle>
						<Edit2Icon className="h-4 w-4 text-yellow-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.draft}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							{t("listings.stats.sold")}
						</CardTitle>
						<TagIcon className="h-4 w-4 text-gray-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.sold}</div>
					</CardContent>
				</Card>
			</div>

			{/* Listings Management */}
			<Card>
				<CardHeader className="flex flex-row items-center justify-between">
					<CardTitle>{t("listings.yourListings")}</CardTitle>
					<Link href="/create-listing">
						<Button>
							<PlusIcon className="mr-2 h-4 w-4" />
							{t("listings.createNew")}
						</Button>
					</Link>
				</CardHeader>
				<CardContent>
					<Tabs value={activeTab} onValueChange={setActiveTab}>
						<TabsList className="grid w-full grid-cols-4">
							<TabsTrigger value="all">
								{t("listings.tabs.all")} ({stats.total})
							</TabsTrigger>
							<TabsTrigger value="active">
								{t("listings.tabs.active")} ({stats.active})
							</TabsTrigger>
							<TabsTrigger value="draft">
								{t("listings.tabs.draft")} ({stats.draft})
							</TabsTrigger>
							<TabsTrigger value="sold">
								{t("listings.tabs.sold")} ({stats.sold})
							</TabsTrigger>
						</TabsList>

						<TabsContent value={activeTab} className="mt-4">
							{loading ? (
								<div className="flex items-center justify-center py-8">
									<p className="text-muted-foreground">
										{t("common.loading")}
									</p>
								</div>
							) : filteredListings.length === 0 ? (
								<div className="flex flex-col items-center justify-center py-12 text-center">
									<TagIcon className="h-12 w-12 text-muted-foreground/20 mb-4" />
									<p className="text-muted-foreground">
										{activeTab === "all"
											? t("listings.noListings")
											: t(
													"listings.noListingsInCategory",
												)}
									</p>
									<Link href="/create-listing">
										<Button
											className="mt-4"
											variant="outline"
										>
											<PlusIcon className="mr-2 h-4 w-4" />
											{t("listings.createFirst")}
										</Button>
									</Link>
								</div>
							) : (
								<div className="space-y-4">
									{filteredListings.map((listing) => (
										<Card
											key={listing.id}
											className="overflow-hidden"
										>
											<div className="flex items-center gap-4 p-4">
												{/* Image */}
												<div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
													{listing.images?.[0] ? (
														<Image
															src={getStrapiImageUrl(
																listing
																	.images[0]
																	.url,
															)}
															alt={listing.title}
															fill
															className="object-cover"
														/>
													) : (
														<div className="flex h-full items-center justify-center">
															<ImageIcon className="h-8 w-8 text-muted-foreground/20" />
														</div>
													)}
												</div>

												{/* Info */}
												<div className="flex-1 space-y-1">
													<div className="flex items-start justify-between">
														<div>
															<h3 className="font-medium line-clamp-1">
																{listing.title}
															</h3>
															<div className="flex items-center gap-4 text-sm text-muted-foreground">
																{listing.location && (
																	<span className="flex items-center gap-1">
																		<MapPinIcon className="h-3 w-3" />
																		{
																			listing.location
																		}
																	</span>
																)}
																{listing.price && (
																	<span className="font-medium">
																		$
																		{
																			listing.price
																		}
																	</span>
																)}
																<span className="flex items-center gap-1">
																	<CalendarIcon className="h-3 w-3" />
																	{new Date(
																		listing.createdAt,
																	).toLocaleDateString()}
																</span>
															</div>
														</div>
														{getStatusBadge(
															listing.status,
														)}
													</div>
													{listing
														.categories?.[0] && (
														<p className="text-sm text-muted-foreground">
															{
																listing
																	.categories[0]
																	.name
															}
														</p>
													)}
												</div>

												{/* Actions */}
												<div className="flex items-center gap-2">
													<Link
														href={`/edit-listing/${listing.documentId}`}
													>
														<Button
															variant="outline"
															size="sm"
														>
															<Edit2Icon className="h-4 w-4" />
														</Button>
													</Link>
													<Button
														variant="outline"
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
														<Trash2Icon className="h-4 w-4" />
													</Button>
												</div>
											</div>
										</Card>
									))}
								</div>
							)}
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>
		</div>
	);
}
