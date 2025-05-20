import { getImageUrl, getListingById } from "@marketplace/api";
import ListingDetail from "./components/ListingDetail";

interface PageProps {
	params: {
		id: string;
		locale: string;
	};
}

interface Listing {
	id: string;
	title: string;
	price: number;
	author: string;
	description: string;
	authorEmail: string;
	authorPhone: string;
	images: string[];
	location: string;
	createdAt: Date;
}

export default async function ListingDetailPage({ params }: PageProps) {
	// Fetch listing from Strapi
	let listing: Listing;

	try {
		const response = await getListingById(params.id);
		const strapiListing = response.data;

		// Format the data for the ListingDetail component
		listing = {
			id: strapiListing.id.toString(),
			title: strapiListing.title,
			price: strapiListing.price || 0,
			author: "Listing Owner", // This might need to come from user data
			description: strapiListing.description,
			authorEmail: "contact@example.com", // This might need to come from user data
			authorPhone: "+1234567890", // This might need to come from user data
			images: strapiListing.images.map((img) => getImageUrl(img)),
			location: strapiListing.location || "Unknown",
			createdAt: new Date(strapiListing.createdAt),
		};
	} catch (error) {
		// Fallback to mock data if the API fails
		console.error("Error fetching listing:", error);

		listing = {
			id: params.id,
			title: "Luxury Diplomatic Furniture Set",
			price: 2500,
			author: "John Diplomat",
			description: `This exclusive furniture set is perfect for diplomatic residences, featuring elegant design and superior craftsmanship. The set includes a sofa, two armchairs, and a coffee table.

The pieces were imported from Italy just 8 months ago and are in excellent condition with minimal use. All items are made from high-quality materials, including genuine leather upholstery and solid hardwood frames.

This is a rare opportunity to acquire a premium furniture set at a fraction of the retail price. Ideal for embassy residences or diplomatic housing.`,
			authorEmail: "john.diplomat@embassy.gov",
			authorPhone: "+972 50-123-4567",
			images: [
				"/images/hero-image.png",
				"/images/hero-image.png",
				"/images/hero-image.png",
			],
			location: "Tel Aviv",
			createdAt: new Date(2023, 11, 10),
		};
	}

	return <ListingDetail listing={listing} />;
}
