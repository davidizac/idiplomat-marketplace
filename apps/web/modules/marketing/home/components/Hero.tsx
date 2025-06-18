"use client";

import { LocaleLink } from "@i18n/routing";
import { Button } from "@ui/components/button";
import { ArrowRightIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function Hero() {
	return (
		<div className="relative min-h-screen flex flex-col">
			{/* Hero main content */}
			<div className="relative flex-1 flex items-center justify-center pt-16">
				{/* Background image with overlay */}
				<div className="absolute inset-0 overflow-hidden">
					<Image
						src="/images/cities/telaviv-jaffa.jpg"
						alt="Tel Aviv Jaffa"
						fill
						className="object-cover object-center"
						priority
						sizes="100vw"
					/>
					<div className="absolute inset-0 bg-gradient-to-b from-background/70 to-background/40" />
				</div>

				{/* Hero content */}
				<div className="container relative z-10 py-16 flex flex-col items-center text-center">
					<h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
						I-Diplomat Marketplace
					</h1>
					<p className="text-xl md:text-2xl text-foreground/80 max-w-3xl mx-auto mb-8">
						A trusted marketplace exclusively for diplomats in
						Israel to buy and sell items within the diplomatic
						community.
					</p>
					<div className="flex flex-col sm:flex-row gap-4">
						<Button size="lg" variant="default" asChild>
							<Link href="/listings">
								Browse Listings
								<ArrowRightIcon className="ml-2 h-4 w-4" />
							</Link>
						</Button>
						<Button size="lg" variant="outline" asChild>
							<LocaleLink href="#how-it-works">
								How It Works
							</LocaleLink>
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
