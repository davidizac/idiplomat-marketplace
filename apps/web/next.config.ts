import { withContentCollections } from "@content-collections/next";
import type { NextConfig } from "next";
import nextIntlPlugin from "next-intl/plugin";

const withNextIntl = nextIntlPlugin("./modules/i18n/request.ts");

const nextConfig: NextConfig = {
	transpilePackages: ["@repo/api", "@repo/auth", "@repo/database"],
	images: {
		remotePatterns: [
			{
				// google profile images
				protocol: "https",
				hostname: "lh3.googleusercontent.com",
			},
			{
				// github profile images
				protocol: "https",
				hostname: "avatars.githubusercontent.com",
			},
			{
				// local development server
				protocol: "http",
				hostname: "localhost",
				port: "1337",
				pathname: "/uploads/**",
			},
			{
				protocol: "https",
				hostname: "useful-horses-54f6b619ab.media.strapiapp.com",
			},
		],
	},
	async redirects() {
		return [
			{
				source: "/docs",
				destination: "/listings",
				permanent: true,
			},
			{
				source: "/docs/:path*",
				destination: "/listings",
				permanent: true,
			},
			{
				source: "/:locale/docs",
				destination: "/:locale/listings",
				permanent: true,
			},
			{
				source: "/:locale/docs/:path*",
				destination: "/:locale/listings",
				permanent: true,
			},
			{
				source: "/blog",
				destination: "/listings",
				permanent: true,
			},
			{
				source: "/:locale/blog",
				destination: "/:locale/listings",
				permanent: true,
			},
			{
				source: "/:locale/blog/:path*",
				destination: "/:locale/listings",
				permanent: true,
			},
			{
				source: "/changelog",
				destination: "/listings",
				permanent: true,
			},
			{
				source: "/:locale/changelog",
				destination: "/:locale/listings",
				permanent: true,
			},
			{
				source: "/app/settings",
				destination: "/app/settings/general",
				permanent: true,
			},
			{
				source: "/app/:organizationSlug/settings",
				destination: "/app/:organizationSlug/settings/general",
				permanent: true,
			},
			{
				source: "/app/admin",
				destination: "/app/admin/users",
				permanent: true,
			},
		];
	},
	eslint: {
		ignoreDuringBuilds: true,
	},
};

export default withContentCollections(withNextIntl(nextConfig));
