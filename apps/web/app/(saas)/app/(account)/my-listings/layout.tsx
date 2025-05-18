export default function MyListingsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <div className="container max-w-6xl py-6">{children}</div>;
}
