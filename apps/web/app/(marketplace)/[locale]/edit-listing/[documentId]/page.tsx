import { listingService } from "@repo/cms";
import { getSession } from "@saas/auth/lib/server";
import { notFound, redirect } from "next/navigation";
import { withQuery } from "ufo";
import EditListingForm from "./components/EditListingForm";

export default async function EditListingPage({ params }: any) {
	const { documentId } = await params;

	// Retrieve server session (returns null if not authenticated)
	const session = await getSession();

	// If no active session, redirect to the auth login page with redirectTo parameter
	if (!session) {
		redirect(
			withQuery("/auth/login", {
				redirectTo: `/edit-listing/${documentId}`,
			}),
		);
	}

	// Fetch the listing
	try {
		const listing = await listingService.getListingById(documentId);

		// TODO: Check if the user owns this listing when backend supports user filtering
		// For now, we'll allow editing any listing

		return (
			<EditListingForm
				listing={listing}
				userId={session.user?.id ?? ""}
			/>
		);
	} catch (error) {
		// If listing not found, show 404
		notFound();
	}
}
