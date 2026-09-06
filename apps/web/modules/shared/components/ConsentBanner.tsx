"use client";

import { useCookieConsent } from "@shared/hooks/cookie-consent";
import { Button } from "@ui/components/button";
import { CookieIcon } from "lucide-react";
import { useEffect, useState } from "react";

export function ConsentBanner() {
	const { userHasConsented, allowCookies, declineCookies } =
		useCookieConsent();
	const [mounted, setMounted] = useState(false);
	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return null;
	}

	if (userHasConsented) {
		return null;
	}

	return (
		<div className="fixed inset-x-0 bottom-0 z-50 border-t bg-card/95 backdrop-blur-sm">
			<div className="container flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
				<p className="flex items-start gap-2 text-sm leading-normal text-card-foreground">
					<CookieIcon className="mt-0.5 size-4 shrink-0 text-primary/60" />
					<span>
						We use cookies to run the marketplace and understand
						how it is used. By clicking Allow, you consent to our
						use of cookies.
					</span>
				</p>
				<div className="flex shrink-0 gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => declineCookies()}
					>
						Decline
					</Button>
					<Button size="sm" onClick={() => allowCookies()}>
						Allow
					</Button>
				</div>
			</div>
		</div>
	);
}
