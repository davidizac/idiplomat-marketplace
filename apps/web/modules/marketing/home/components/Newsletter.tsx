"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@ui/components/button";
import { Form, FormControl, FormField, FormItem } from "@ui/components/form";
import { Input } from "@ui/components/input";
import { Bell, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
	email: z.string().email("Please enter a valid email address"),
});

export function Newsletter() {
	const [isSuccess, setIsSuccess] = useState(false);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
		},
	});

	async function onSubmit(values: z.infer<typeof formSchema>) {
		// This would normally make an API call
		console.log("Subscribing with email:", values.email);

		// Simulate success
		setIsSuccess(true);
		form.reset();
	}

	return (
		<section className="py-20 bg-muted/50">
			<div className="container max-w-4xl">
				<div className="flex flex-col items-center justify-center gap-8 md:flex-row md:gap-16">
					<div className="flex-1 text-center md:text-left">
						<div className="inline-flex items-center rounded-lg bg-primary/10 p-2 text-primary mb-4">
							<Bell className="h-5 w-5" />
						</div>
						<h2 className="text-3xl font-bold tracking-tight mb-3">
							Stay updated on new listings
						</h2>
						<p className="text-foreground/60 mb-4">
							Subscribe to get alerts when new items matching your
							interests are listed. Never miss out on diplomatic
							community opportunities.
						</p>

						<div className="hidden md:block">
							<div className="space-y-2 mt-6">
								<div className="flex items-center gap-2">
									<CheckCircle2 className="h-4 w-4 text-primary" />
									<span className="text-sm text-foreground/70">
										Get notified about listings in your area
									</span>
								</div>
								<div className="flex items-center gap-2">
									<CheckCircle2 className="h-4 w-4 text-primary" />
									<span className="text-sm text-foreground/70">
										Receive updates on diplomatic community
										events
									</span>
								</div>
								<div className="flex items-center gap-2">
									<CheckCircle2 className="h-4 w-4 text-primary" />
									<span className="text-sm text-foreground/70">
										Learn about exclusive diplomatic
										benefits
									</span>
								</div>
							</div>
						</div>
					</div>

					<div className="flex-1 w-full">
						{!isSuccess ? (
							<Form {...form}>
								<form
									onSubmit={form.handleSubmit(onSubmit)}
									className="w-full space-y-4"
								>
									<FormField
										control={form.control}
										name="email"
										render={({ field }) => (
											<FormItem>
												<FormControl>
													<Input
														placeholder="Your email address"
														{...field}
														className="h-12"
													/>
												</FormControl>
											</FormItem>
										)}
									/>
									<Button
										type="submit"
										className="w-full h-12"
										disabled={form.formState.isSubmitting}
									>
										{form.formState.isSubmitting
											? "Subscribing..."
											: "Subscribe to listing alerts"}
									</Button>
								</form>
							</Form>
						) : (
							<div className="flex h-full flex-col items-center justify-center rounded-xl border bg-card p-8 text-center">
								<div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
									<CheckCircle2 className="size-6" />
								</div>
								<h3 className="mt-4 font-medium">
									Thanks for subscribing!
								</h3>
								<p className="mt-1 text-sm text-foreground/60">
									You'll now receive updates about the
									I-Diplomat Marketplace community and
									listings that match your interests.
								</p>
							</div>
						)}

						<div className="md:hidden">
							<div className="space-y-2 mt-6">
								<div className="flex items-center gap-2">
									<CheckCircle2 className="h-4 w-4 text-primary" />
									<span className="text-sm text-foreground/70">
										Get notified about listings in your area
									</span>
								</div>
								<div className="flex items-center gap-2">
									<CheckCircle2 className="h-4 w-4 text-primary" />
									<span className="text-sm text-foreground/70">
										Receive updates on diplomatic community
										events
									</span>
								</div>
								<div className="flex items-center gap-2">
									<CheckCircle2 className="h-4 w-4 text-primary" />
									<span className="text-sm text-foreground/70">
										Learn about exclusive diplomatic
										benefits
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
