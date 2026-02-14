"use client";

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@ui/components/accordion";
import { Button } from "@ui/components/button";
import {} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

const faqItemKeys = ["1", "2", "3", "4", "5", "6"] as const;

export function FaqSection() {
	const t = useTranslations("marketing.faq");

	return (
		<section id="faq" className="scroll-my-20 py-20 bg-muted/30">
			<div className="container max-w-6xl">
				{/* <div className="grid gap-12 md:grid-cols-2 items-center mb-16">
					<div className="order-2 md:order-1">
						<h2 className="font-bold text-3xl mb-6">
							Watch How It Works
						</h2>
						<p className="text-foreground/70 mb-8">
							See how the i-Diplomat Marketplace works in practice
							and how it can help you buy and sell within the
							diplomatic community in Israel.
						</p>
						<div className="space-y-4">
							<div className="flex items-center gap-3">
								<div className="bg-primary/10 p-2 rounded-full">
									<PlayCircle className="h-5 w-5 text-primary" />
								</div>
								<p className="text-sm font-medium">
									See how to create your first listing
								</p>
							</div>
							<div className="flex items-center gap-3">
								<div className="bg-primary/10 p-2 rounded-full">
									<PlayCircle className="h-5 w-5 text-primary" />
								</div>
								<p className="text-sm font-medium">
									Learn about diplomatic benefits
								</p>
							</div>
							<div className="flex items-center gap-3">
								<div className="bg-primary/10 p-2 rounded-full">
									<PlayCircle className="h-5 w-5 text-primary" />
								</div>
								<p className="text-sm font-medium">
									Understand the verification process
								</p>
							</div>
						</div>
						<div className="mt-8">
							<Button size="sm" asChild>
								<Link href="/tutorials">
									View all tutorials
									<ArrowRightIcon className="ml-2 h-4 w-4" />
								</Link>
							</Button>
						</div>
					</div>

					<div className="order-1 md:order-2">
						<div className="aspect-video w-full bg-card rounded-xl overflow-hidden border shadow-md">
							<iframe
								className="w-full h-full"
								src="https://www.youtube.com/embed/dQw4w9WgXcQ"
								title="i-Diplomat Marketplace Tutorial"
								frameBorder="0"
								allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
								allowFullScreen
							/>
						</div>
					</div>
				</div> */}

				<div className="mb-12 text-center">
					<h2 className="font-bold text-4xl mb-4">
						{t("title")}
					</h2>
					<p className="text-lg text-foreground/60 max-w-2xl mx-auto">
						{t("description")}
					</p>
				</div>

				<div className="max-w-3xl mx-auto">
					<Accordion type="single" collapsible className="w-full">
						{faqItemKeys.map((key) => (
							<AccordionItem key={key} value={`item-${key}`}>
								<AccordionTrigger className="text-left font-medium">
									{t(`items.q${key}`)}
								</AccordionTrigger>
								<AccordionContent className="text-foreground/70">
									{t(`items.a${key}`)}
								</AccordionContent>
							</AccordionItem>
						))}
					</Accordion>

					<div className="mt-8 text-center">
						<p className="text-foreground/60 mb-4">
							{t("stillHaveQuestions")}
						</p>
						<Button variant="outline" asChild>
							<Link href="/contact">{t("contactSupport")}</Link>
						</Button>
					</div>
				</div>
			</div>
		</section>
	);
}
