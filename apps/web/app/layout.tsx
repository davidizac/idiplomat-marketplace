import type { Metadata } from "next";
import type { PropsWithChildren } from "react";
import "./globals.css";
import "cropperjs/dist/cropper.css";
import { config } from "@repo/config";
import { Document } from "@shared/components/Document";

export const metadata: Metadata = {
	title: {
		absolute: config.appName,
		default: config.appName,
		template: `%s | ${config.appName}`,
	},
};

export default function RootLayout({ children }: PropsWithChildren) {
	// Use default locale for top-level document; sub-layouts handle real locale
	return <Document locale={config.i18n.defaultLocale}>{children}</Document>;
}
