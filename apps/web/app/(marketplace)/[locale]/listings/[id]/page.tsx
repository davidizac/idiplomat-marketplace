import ListingDetail from "./components/ListingDetail";
import { loadListing } from "./loader";

export default async function ListingDetailPage({ params }: any) {
	// Load listing data using the loader
	const listing = await loadListing(params.id);
	return <ListingDetail listing={listing} />;
}
