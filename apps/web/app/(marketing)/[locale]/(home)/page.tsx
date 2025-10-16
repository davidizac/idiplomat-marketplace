import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";

export default async function Home({ params }: any) {
	const { locale } = params;
	setRequestLocale(locale);

	// Redirect to listings page as it's now the main landing page
	redirect(`/${locale}/listings`);
}
