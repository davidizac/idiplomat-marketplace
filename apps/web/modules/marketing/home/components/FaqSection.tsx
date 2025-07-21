"use client";

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@ui/components/accordion";
import { Button } from "@ui/components/button";
import { ArrowRightIcon, PlayCircle } from "lucide-react";
import Link from "next/link";

const faqItems = [
	{
		question: "Who can use the i-Diplomat Marketplace?",
		answer: "The i-Diplomat Marketplace is exclusively available to verified members of the diplomatic community in Israel, including diplomats, embassy staff, and their families.",
	},
	{
		question: "Is there a fee to list items on the marketplace?",
		answer: "No, listing items on the i-Diplomat Marketplace is completely free for all verified diplomatic personnel.",
	},
	{
		question: "How do I verify my diplomatic status?",
		answer: "During registration, you'll be asked to provide your diplomatic credentials which our team will verify. This includes your diplomatic ID, embassy information, and contact details.",
	},
	{
		question: "Can I sell duty-free items?",
		answer: "Yes, as a diplomat, you can sell duty-free items to other diplomats following the regulations set by the Israeli Ministry of Foreign Affairs regarding diplomatic privileges.",
	},
	{
		question: "How are payments handled?",
		answer: "The i-Diplomat Marketplace is a platform for connecting buyers and sellers. Payments are arranged directly between the parties involved. We recommend secure payment methods and meeting in safe locations.",
	},
	{
		question: "Can I list services as well as products?",
		answer: "Yes, the marketplace supports listings for both physical products and services that may be valuable to the diplomatic community.",
	},
];

export function FaqSection() {
	return (
		<section className="py-20 bg-muted/30">
			<div className="container max-w-6xl">
				<div className="grid gap-12 md:grid-cols-2 items-center mb-16">
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
				</div>

				<div className="mb-12 text-center">
					<h2 className="font-bold text-4xl mb-4">
						Frequently Asked Questions
					</h2>
					<p className="text-lg text-foreground/60 max-w-2xl mx-auto">
						Got questions about the i-Diplomat Marketplace? We've
						got answers to the most common questions.
					</p>
				</div>

				<div className="max-w-3xl mx-auto">
					<Accordion type="single" collapsible className="w-full">
						{faqItems.map((item, index) => (
							<AccordionItem key={index} value={`item-${index}`}>
								<AccordionTrigger className="text-left font-medium">
									{item.question}
								</AccordionTrigger>
								<AccordionContent className="text-foreground/70">
									{item.answer}
								</AccordionContent>
							</AccordionItem>
						))}
					</Accordion>

					<div className="mt-8 text-center">
						<p className="text-foreground/60 mb-4">
							Still have questions? We're here to help.
						</p>
						<Button variant="outline" asChild>
							<Link href="/contact">Contact Support</Link>
						</Button>
					</div>
				</div>
			</div>
		</section>
	);
}
