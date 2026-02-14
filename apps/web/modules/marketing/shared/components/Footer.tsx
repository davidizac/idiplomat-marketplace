import { LocaleLink } from "@i18n/routing";
import { config } from "@repo/config";
import { Logo } from "@shared/components/Logo";
import { useTranslations } from "next-intl";

export function Footer() {
	const t = useTranslations("marketing.footer");
	return (
		<footer className="border-t py-8 text-foreground/60 text-sm">
			<div className="container grid grid-cols-1 gap-6 lg:grid-cols-3">
				<div>
					<Logo className="opacity-70 grayscale" />
					<p className="mt-3 text-sm opacity-70">
						© {new Date().getFullYear()} {config.appName}. .
					</p>
				</div>

				<div className="flex flex-col gap-2">
					<LocaleLink
						href="https://blog.i-diplomat.com"
						className="block"
					>
						{t("blog")}
					</LocaleLink>
				</div>
				{/* 
				<div className="flex flex-col gap-2">
					<LocaleLink href="/legal/privacy-policy" className="block">
						Privacy policy
					</LocaleLink>

					<LocaleLink href="/legal/terms" className="block">
						Terms and conditions
					</LocaleLink>
				</div> */}
			</div>
		</footer>
	);
}
