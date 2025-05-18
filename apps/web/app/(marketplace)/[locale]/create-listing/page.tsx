import { getSession } from "@saas/auth/lib/server";
import { redirect } from "next/navigation";
import { withQuery } from "ufo";
import ListingForm from "./components/ListingForm";

export default async function CreateListingPage() {
	// Retrieve server session (returns null if not authenticated)
	const session = await getSession();

	// If no active session, redirect to the auth login page with redirectTo parameter
	if (!session) {
		redirect(withQuery("/auth/login", { redirectTo: "/create-listing" }));
	}

	// session.user should contain user data with an id
	const userId = session.user?.id ?? "";

	return <ListingForm userId={userId} />;
}
