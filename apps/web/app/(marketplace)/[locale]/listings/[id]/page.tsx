import ListingDetail from "./components/ListingDetail";

interface PageProps {
	params: {
		id: string;
		locale: string;
	};
}

export default function ListingDetailPage({ params }: PageProps) {
	// This would come from your API in a real implementation
	const mockListing = {
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

	return <ListingDetail listing={mockListing} />;
}
