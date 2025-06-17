import { FaqSection } from "@marketing/home/components/FaqSection";
import { Features } from "@marketing/home/components/Features";
import { Hero } from "@marketing/home/components/Hero";
import { Newsletter } from "@marketing/home/components/Newsletter";
import { PricingSection } from "@marketing/home/components/PricingSection";
import { setRequestLocale } from "next-intl/server";

export default async function Home({ params }: any) {
	const { locale } = params;
	setRequestLocale(locale);

	return (
		<>
			<Hero />
			<Features />
			<PricingSection />
			<FaqSection />
			<Newsletter />
		</>
	);
}
