import { config } from "@repo/config";
import type { MetadataRoute } from "next";

const locales = config.i18n.enabled
	? Object.keys(config.i18n.locales)
	: [config.i18n.defaultLocale];

const disallowed = locales.flatMap((locale) => [
	`/${locale}/docs`,
	`/${locale}/blog`,
	`/${locale}/changelog`,
]);

export default function robots(): MetadataRoute.Robots {
	return {
		rules: {
			userAgent: "*",
			allow: "/",
			disallow: ["/docs", "/blog", "/changelog", ...disallowed],
		},
	};
}
