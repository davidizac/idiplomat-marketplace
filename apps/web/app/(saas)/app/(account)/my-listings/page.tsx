import { getSession } from "@saas/auth/lib/server";
import { PageHeader } from "@saas/shared/components/PageHeader";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import MyListings from "./components/MyListings";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata() {
	const t = await getTranslations();

	return {
		title: t("myListings.title"),
	};
}

export default async function MyListingsPage() {
	const session = await getSession();

	if (!session) {
		return redirect("/auth/login");
	}

	const t = await getTranslations();

	return (
		<div className="space-y-6">
			<PageHeader
				title={t("myListings.title")}
				subtitle={t("myListings.subtitle")}
			/>

			<MyListings userId={session.user.id} />
		</div>
	);
}
