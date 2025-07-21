import React from "react";

export function Logo({
	withLabel = true,
}: {
	withLabel?: boolean;
}) {
	return (
		<span className="flex items-center font-semibold text-primary leading-none">
			<img
				src="/images/i-diplomat-white-bg.png"
				alt="i-Diplomat Logo"
				className="h-8 w-auto"
			/>
			{withLabel && (
				<span className="ml-3 text-xl">i-Diplomat Marketplace</span>
			)}
		</span>
	);
}
