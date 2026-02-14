"use client";

import { LocaleLink, useLocalePathname } from "@i18n/routing";
import { config } from "@repo/config";
import { useSession } from "@saas/auth/hooks/use-session";
import { LocaleSwitch } from "@shared/components/LocaleSwitch";
import { Logo } from "@shared/components/Logo";
import { Button } from "@ui/components/button";
import { Input } from "@ui/components/input";
import {
	Sheet,
	SheetContent,
	SheetTitle,
	SheetTrigger,
} from "@ui/components/sheet";
import { cn } from "@ui/lib";
import { Home, MenuIcon, PlusCircle, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import NextLink from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useDebounceCallback } from "usehooks-ts";

export function NavBar() {
	const t = useTranslations();
	const { user } = useSession();
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const localePathname = useLocalePathname();
	const [isTop, setIsTop] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");

	const debouncedScrollHandler = useDebounceCallback(
		() => {
			setIsTop(window.scrollY <= 10);
		},
		150,
		{
			maxWait: 150,
		},
	);

	useEffect(() => {
		window.addEventListener("scroll", debouncedScrollHandler);
		debouncedScrollHandler();
		return () => {
			window.removeEventListener("scroll", debouncedScrollHandler);
		};
	}, [debouncedScrollHandler]);

	useEffect(() => {
		setMobileMenuOpen(false);
	}, [localePathname]);

	const isDocsPage = localePathname.startsWith("/docs");

	const menuItems = [
		{ label: t("common.menu.home"), href: "/listings" },
		{ label: t("marketing.navbar.browseListings"), href: "/listings" },
		{ label: t("marketing.navbar.categories"), href: "/categories" },
		{ label: t("marketing.navbar.howItWorks"), href: "/listings#how-it-works" },
		{ label: t("common.menu.faq"), href: "/listings#faq" },
	];

	const isMenuItemActive = (href: string) => localePathname.startsWith(href);

	// Handle search submission
	const handleSearchSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (searchQuery) {
			// Navigate to listings page with search query
			window.location.href = `/listings?search=${encodeURIComponent(searchQuery)}`;
		} else {
			// Just go to listings page
			window.location.href = "/listings";
		}
	};

	return (
		<nav
			className={cn(
				"fixed top-0 left-0 z-50 w-full transition-all duration-200",
				!isTop || isDocsPage
					? "bg-card/80 shadow-sm backdrop-blur-lg py-2"
					: "bg-transparent py-4",
			)}
			data-test="navigation"
		>
			<div className="container">
				<div className="flex items-center justify-between gap-2">
					<div className="flex items-center gap-2">
						{/* Home Button - Go to i-diplomat.com */}
						<Button
							variant="ghost"
							size="icon"
							className="shrink-0"
							asChild
						>
							<NextLink href="https://i-diplomat.com">
								<Home className="h-5 w-5" />
							</NextLink>
						</Button>

						<LocaleLink
							href="/listings"
							className="flex items-center gap-2 hover:no-underline shrink-0"
						>
							<Logo className="h-10" />
						</LocaleLink>
					</div>

					{/* Search Bar - Centered in navbar */}
					<div className="flex-1 max-w-xl mx-auto px-4">
						<form onSubmit={handleSearchSubmit}>
							<div className="relative">
								<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
								<Input
									placeholder={t("marketing.navbar.searchPlaceholder")}
									className="pl-10 h-9 w-full rounded-full bg-muted/50 focus:bg-muted focus:ring-1 focus:ring-primary/20 border-none"
									value={searchQuery}
									onChange={(e) =>
										setSearchQuery(e.target.value)
									}
								/>
							</div>
						</form>
					</div>

					{/* Right Side Actions */}
					<div className="flex items-center gap-2">
						{/* Language Switcher */}
						{config.i18n.enabled && (
							<Suspense>
								<LocaleSwitch withLocaleInUrl={true} />
							</Suspense>
						)}

						{/* Login/Dashboard Button */}
						{config.ui.saas.enabled && (
							<Button
								variant="ghost"
								size="sm"
								className="hidden md:flex"
								asChild
							>
								<NextLink href={user ? "/app" : "/auth/login"}>
									{user ? t("common.menu.dashboard") : t("common.menu.login")}
								</NextLink>
							</Button>
						)}

						{/* Post Listing Button */}
						<Button
							variant="default"
							size="sm"
							className="hidden md:flex"
							asChild
						>
							<NextLink href="/create-listing">
								<PlusCircle className="mr-2 h-4 w-4" />
								{t("marketing.navbar.postListing")}
							</NextLink>
						</Button>

						{/* Mobile Menu Trigger */}
						<Sheet
							open={mobileMenuOpen}
							onOpenChange={setMobileMenuOpen}
						>
							<SheetTrigger asChild>
								<Button
									className="md:hidden"
									size="icon"
									variant="ghost"
									aria-label={t("marketing.navbar.menu")}
								>
									<MenuIcon className="h-5 w-5" />
								</Button>
							</SheetTrigger>
							<SheetContent className="w-64" side="right">
								<SheetTitle className="text-left mb-6">
									{t("marketing.navbar.menu")}
								</SheetTitle>
								<div className="flex flex-col space-y-3">
									{menuItems.map((item) => (
										<LocaleLink
											key={item.href}
											href={item.href}
											className={cn(
												"px-3 py-2 rounded-md text-base",
												isMenuItemActive(item.href)
													? "font-semibold bg-primary/5"
													: "text-foreground/70",
											)}
										>
											{item.label}
										</LocaleLink>
									))}
									<hr className="my-2 border-muted" />
									<NextLink
										href={user ? "/app" : "/auth/login"}
										className="px-3 py-2 rounded-md text-base"
									>
										{user ? t("common.menu.dashboard") : t("common.menu.login")}
									</NextLink>
									<NextLink
										href="/contact"
										className="px-3 py-2 rounded-md text-base text-foreground/70"
									>
										{t("common.menu.contact")}
									</NextLink>
									{config.i18n.enabled && (
										<div className="px-3 py-2">
											<Suspense>
												<LocaleSwitch withLocaleInUrl={true} />
											</Suspense>
										</div>
									)}
									<NextLink
										href="/create-listing"
										className="mt-4 w-full flex justify-center px-3 py-2 bg-primary text-primary-foreground rounded-md font-medium"
									>
										{t("marketing.navbar.postListing")}
									</NextLink>
								</div>
							</SheetContent>
						</Sheet>
					</div>
				</div>
			</div>
		</nav>
	);
}
