"use client";
import { BadgeCheck, MessageCircle, Search, Upload } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

const howItWorksStepsMeta = [
	{ id: "step1", titleKey: "steps.signUp" as const, descKey: "steps.signUpDesc" as const, icon: BadgeCheck, href: undefined },
	{ id: "step2", titleKey: "steps.postItems" as const, descKey: "steps.postItemsDesc" as const, icon: Upload, href: undefined },
	{ id: "step3", titleKey: "steps.browseListings" as const, descKey: "steps.browseListingsDesc" as const, icon: Search, href: "/listings" as const },
	{ id: "step4", titleKey: "steps.connectDirectly" as const, descKey: "steps.connectDirectlyDesc" as const, icon: MessageCircle, href: undefined },
];

export function Features() {
	const t = useTranslations("marketing.features");

	return (
		<section id="how-it-works" className="scroll-my-20 py-20 bg-muted/30">
			<div className="container max-w-5xl">
				<div className="mx-auto mb-12 text-center">
					<h2 className="font-bold text-4xl lg:text-5xl mb-4">
						{t("title")}
					</h2>
					<p className="mt-4 text-balance text-lg text-foreground/60 max-w-2xl mx-auto">
						{t("description")}
					</p>
				</div>

				<div className="grid gap-8 md:grid-cols-2 lg:gap-12  mb-12">
					<div>
						<h3 className="text-2xl font-bold mb-4">
							{t("forDiplomatsOnly")}
						</h3>
						<p className="text-foreground/70 mb-6">
							{t("forDiplomatsOnlyDesc")}
						</p>
					</div>
					<div>
						<h3 className="text-2xl font-bold mb-4">
							{t("directConnections")}
						</h3>
						<p className="text-foreground/70">
							{t("directConnectionsDesc")}
						</p>
					</div>
				</div>

				<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
					{howItWorksStepsMeta.map((step) => (
						<div
							key={step.id}
							className="flex flex-col p-6 bg-card rounded-xl border shadow-sm"
						>
							<div className="mb-4 p-2 w-fit rounded-full bg-primary/10">
								<step.icon className="h-6 w-6 text-primary" />
							</div>
							{step.href ? (
								<Link href={step.href} className="group">
									<h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
										{t(step.titleKey)}
									</h3>
									<p className="text-foreground/60">
										{t(step.descKey)}
									</p>
								</Link>
							) : (
								<>
									<h3 className="text-xl font-bold mb-2">
										{t(step.titleKey)}
									</h3>
									<p className="text-foreground/60">
										{t(step.descKey)}
									</p>
								</>
							)}
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
