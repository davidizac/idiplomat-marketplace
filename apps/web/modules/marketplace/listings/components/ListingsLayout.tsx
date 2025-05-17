interface ListingsLayoutProps {
	children: React.ReactNode;
}

export function ListingsLayout({ children }: ListingsLayoutProps) {
	return (
		<div className="container py-8">
			<div className="flex gap-8">{children}</div>
		</div>
	);
}
