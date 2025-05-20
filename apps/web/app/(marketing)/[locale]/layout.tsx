import { Footer } from "@marketing/shared/components/Footer";
import { NavBar } from "@marketing/shared/components/NavBar";
import { config } from "@repo/config";
import { SessionProvider } from "@saas/auth/components/SessionProvider";
import { I18nProvider as FumadocsI18nProvider } from "fumadocs-ui/i18n";
import { RootProvider as FumadocsRootProvider } from "fumadocs-ui/provider";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { PropsWithChildren } from "react";

const locales = Object.keys(config.i18n.locales);

export function generateStaticParams() {
	return locales.map((locale) => ({ locale }));
}

export default async function MarketingLayout({
	children,
	params,
}: PropsWithChildren<{ params: { locale: string } }>) {
	const { locale } = params;

	setRequestLocale(locale);

	if (!locales.includes(locale as any)) {
		notFound();
	}

	const messages = await getMessages();

	return (
		<FumadocsI18nProvider locale={locale}>
			<FumadocsRootProvider
				search={{
					enabled: true,
					options: {
						api: "/api/docs-search",
					},
				}}
			>
				<NextIntlClientProvider locale={locale} messages={messages}>
					<SessionProvider>
						<NavBar />
						<main className="min-h-screen pt-16">{children}</main>
						<Footer />
					</SessionProvider>
				</NextIntlClientProvider>
			</FumadocsRootProvider>
		</FumadocsI18nProvider>
	);
}
