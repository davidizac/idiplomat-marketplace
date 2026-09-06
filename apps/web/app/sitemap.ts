import { config } from "@repo/config";
import { getBaseUrl } from "@repo/utils";
import { allLegalPages } from "content-collections";
import type { MetadataRoute } from "next";

const baseUrl = getBaseUrl();
const locales = config.i18n.enabled
	? Object.keys(config.i18n.locales)
	: [config.i18n.defaultLocale];

const marketplacePages = [
	"",
	"/listings",
	"/categories",
	"/create-listing",
	"/contact",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	return [
		...marketplacePages.flatMap((page) =>
			locales.map((locale) => ({
				url: new URL(`/${locale}${page}`, baseUrl).href,
				lastModified: new Date(),
			})),
		),
		...allLegalPages.map((page) => ({
			url: new URL(`/${page.locale}/legal/${page.path}`, baseUrl).href,
			lastModified: new Date(),
		})),
	];
}
