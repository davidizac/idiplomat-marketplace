import { listingService } from "@repo/cms";
import { getSession } from "@saas/auth/lib/server";
import { isListingOwner } from "@marketplace/listings/lib/ownership";
import { notFound, redirect } from "next/navigation";
import { withQuery } from "ufo";
import EditListingForm from "./components/EditListingForm";

export default async function EditListingPage({ params }: any) {
	const { documentId } = await params;
	const session = await getSession();

	if (!session) {
		redirect(
			withQuery("/auth/login", {
				redirectTo: `/edit-listing/${documentId}`,
			}),
		);
	}

	try {
		const listing = await listingService.getListingById(documentId);

		if (!isListingOwner(listing, session.user?.id)) {
			notFound();
		}

		return (
			<EditListingForm
				listing={listing}
				userId={session.user?.id ?? ""}
			/>
		);
	} catch {
		notFound();
	}
}
