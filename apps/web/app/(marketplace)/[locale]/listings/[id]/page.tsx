import ListingDetail from "./components/ListingDetail";
import { loadListing } from "./loader";

interface PageProps {
	params: {
		id: string;
		locale: string;
	};
}

export default async function ListingDetailPage({ params }: PageProps) {
	// Load listing data using the loader
	const listing = await loadListing(params.id);
	return <ListingDetail listing={listing} />;
}
