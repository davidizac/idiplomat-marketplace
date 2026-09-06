import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ListingDetail from "./components/ListingDetail";
import { loadListing } from "./loader";

interface ListingDetailPageProps {
	params: Promise<{ id: string; locale: string }>;
}

export async function generateMetadata({
	params,
}: ListingDetailPageProps): Promise<Metadata> {
	const { id } = await params;

	try {
		const listing = await loadListing(id);
		const description = listing.description
			? listing.description.slice(0, 160)
			: undefined;

		return {
			title: listing.title,
			description,
			openGraph: {
				title: listing.title,
				description,
			},
		};
	} catch {
		return {
			title: "Listing",
		};
	}
}

export default async function ListingDetailPage({
	params,
}: ListingDetailPageProps) {
	const { id } = await params;

	try {
		const listing = await loadListing(id);
		return <ListingDetail listing={listing} />;
	} catch {
		notFound();
	}
}
