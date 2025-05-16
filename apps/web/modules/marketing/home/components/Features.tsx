"use client";
import { BadgeCheck, MessageCircle, Search, Upload } from "lucide-react";
import Image from "next/image";
import howItWorksImage from "../../../../public/images/hero.svg";

export const howItWorksSteps = [
	{
		id: "step1",
		title: "Sign Up",
		description: "Create your account with your diplomatic credentials",
		icon: BadgeCheck,
	},
	{
		id: "step2",
		title: "Post Items",
		description: "List what you want to sell with photos and details",
		icon: Upload,
	},
	{
		id: "step3",
		title: "Browse Listings",
		description: "Find items from other diplomats in Israel",
		icon: Search,
	},
	{
		id: "step4",
		title: "Connect Directly",
		description: "Contact sellers through their provided details",
		icon: MessageCircle,
	},
];

export function Features() {
	return (
		<section id="how-it-works" className="scroll-my-20 py-20 bg-muted/30">
			<div className="container max-w-5xl">
				<div className="mx-auto mb-12 text-center">
					<h2 className="font-bold text-4xl lg:text-5xl mb-4">
						How It Works
					</h2>
					<p className="mt-4 text-balance text-lg text-foreground/60 max-w-2xl mx-auto">
						A simple platform connecting diplomats in Israel who
						want to buy and sell items
					</p>
				</div>

				<div className="grid gap-8 md:grid-cols-2 lg:gap-12 items-center mb-12">
					<div>
						<Image
							src={howItWorksImage}
							alt="How IDiplomat Marketplace works"
							className="w-full rounded-lg shadow-lg"
						/>
					</div>
					<div>
						<h3 className="text-2xl font-bold mb-4">
							For Diplomats Only
						</h3>
						<p className="text-foreground/70 mb-6">
							IDiplomat Marketplace is exclusively for the
							diplomatic community in Israel. All members are
							verified to ensure a trusted environment.
						</p>
						<h3 className="text-2xl font-bold mb-4">
							Direct Connections
						</h3>
						<p className="text-foreground/70">
							Unlike regular marketplaces, we simply help you find
							and connect with other diplomats. All communications
							and arrangements happen directly between members.
						</p>
					</div>
				</div>

				<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
					{howItWorksSteps.map((step) => (
						<div
							key={step.id}
							className="flex flex-col p-6 bg-card rounded-xl border shadow-sm"
						>
							<div className="mb-4 p-2 w-fit rounded-full bg-primary/10">
								<step.icon className="h-6 w-6 text-primary" />
							</div>
							<h3 className="text-xl font-bold mb-2">
								{step.title}
							</h3>
							<p className="text-foreground/60">
								{step.description}
							</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
