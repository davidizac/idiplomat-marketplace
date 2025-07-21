"use client";

export function Newsletter() {
	return (
		<section className="py-20 bg-muted/50">
			<div className="container">
				<div className="flex justify-center mt-4">
					<div className="w-full max-w-md lg:max-w-lg xl:max-w-sm">
						<div className="newsletter-card p-4 rounded-lg shadow bg-card border">
							<h3 className="text-center mb-2 font-semibold">
								Stay Updated
							</h3>
							<p className="text-center mb-3 text-foreground/60">
								Subscribe to get the latest updates and news
								from i-Diplomat Marketplace.
							</p>
							<div className="flex justify-center">
								<iframe
									src="https://embeds.beehiiv.com/39d5a126-4aef-4f56-879a-3d3a512421c9?slim=true"
									data-test-id="beehiiv-embed"
									title="Newsletter Signup"
									height="52"
									frameBorder="0"
									scrolling="no"
									style={{
										margin: 0,
										borderRadius: "0px !important",
										backgroundColor: "transparent",
									}}
									className="w-full"
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
