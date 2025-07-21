import { cn } from "@ui/lib";

export function Logo({
	withLabel = true,
	className,
}: {
	className?: string;
	withLabel?: boolean;
}) {
	return (
		<span
			className={cn(
				"flex items-center font-semibold text-foreground leading-none",
				className,
			)}
		>
			<img
				src="/images/i-diplomat-white-bg.png"
				alt="i-Diplomat Logo"
				className="h-8 w-auto"
			/>
			{withLabel && (
				<span className="ml-3 hidden text-lg md:block">
					i-Diplomat Marketplace
				</span>
			)}
		</span>
	);
}
