"use client";
import { getStrapiImageUrl, listingService } from "@repo/cms";
import type { Listing } from "@repo/cms";
import { cn } from "@ui/lib";
import { Check, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import DetailsStep from "../../../create-listing/components/steps/DetailsStep";
import PhotosStep from "../../../create-listing/components/steps/PhotosStep";
import PricingStep from "../../../create-listing/components/steps/PricingStep";

interface EditListingFormProps {
	listing: Listing;
	userId: string;
}

type Step = "details" | "pricing" | "photos";

interface FormState {
	// Details step
	categories: Array<{
		slug: string;
		name: string;
		documentId: string;
		level: number;
	}>;
	title: string;
	description: string;
	address: string;
	type: "rent" | "sale" | "free";

	// Photos step
	photos: File[];
	existingPhotos?: Array<{ id: number; url: string }>;

	// Pricing step
	price?: number;
	rental_price?: number;
	rental_period?: "hourly" | "daily" | "weekly" | "monthly";

	// Attributes
	attributes: Array<{
		attributeDocumentId: string;
		attributeName: string;
		value: string;
	}>;

	[key: string]: any; // Add index signature to allow string indexing
}

export default function EditListingForm({
	listing,
	userId,
}: EditListingFormProps) {
	const t = useTranslations("marketplace.createListing");
	console.log(listing);
	const [currentStep, setCurrentStep] = useState<Step>("details");
	const [formState, setFormState] = useState<FormState>({
		categories: [],
		title: "",
		description: "",
		address: "",
		type: "sale",
		price: 0,
		rental_price: 0,
		rental_period: "daily",
		photos: [],
		existingPhotos: [],
		attributes: [],
	});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const router = useRouter();

	// Initialize form with existing listing data
	useEffect(() => {
		if (listing) {
			setFormState({
				categories:
					listing.categories?.map((cat: any) => ({
						slug: cat.slug,
						name: cat.name,
						documentId: cat.documentId,
						level: cat.parent ? 1 : 0,
					})) || [],
				title: listing.title || "",
				description: listing.description || "",
				address: listing.address || "",
				type: listing.type || "sale",
				price: listing.price || 0,
				rental_price: listing.rental_price || 0,
				rental_period: listing.rental_period || "daily",
				photos: [],
				existingPhotos:
					listing.images?.map((img: any) => ({
						id: img.id,
						url: getStrapiImageUrl(img.url),
					})) || [],
				attributes:
					listing.product_attribute_values?.map((attrVal: any) => ({
						attributeDocumentId: attrVal.attribute.documentId,
						attributeName: attrVal.attribute.name,
						value: attrVal.value,
					})) || [],
			});
		}
	}, [listing]);

	const steps = [
		{ id: "details", label: t("listingDetails") },
		{ id: "pricing", label: t("pricing") },
		{ id: "photos", label: t("photosStep") },
	];

	// Update form field
	const updateField = (field: string, value: any) => {
		setFormState((prev) => ({ ...prev, [field]: value }));
	};

	// Navigate to next step
	const goToNextStep = () => {
		if (currentStep === "details") {
			setCurrentStep("pricing");
		} else if (currentStep === "pricing") {
			setCurrentStep("photos");
		}
	};

	// Navigate to previous step
	const goToPrevStep = () => {
		if (currentStep === "pricing") {
			setCurrentStep("details");
		} else if (currentStep === "photos") {
			setCurrentStep("pricing");
		}
	};

	const handleSubmit = async () => {
		if (isSubmitting) return;

		try {
			setIsSubmitting(true);

			// Prepare categories array - extract all category documentIds
			const categories = formState.categories.map(
				(cat) => cat.documentId,
			);

			// Prepare attribute values array
			const attributeValues = formState.attributes.map((attr) => ({
				attributeDocumentId: attr.attributeDocumentId,
				value: attr.value,
			}));

			// Prepare images - combine existing photo IDs with new uploads
			const images: Array<
				string | number | { data: File; filename?: string }
			> = [];

			// Add existing photo IDs
			if (
				formState.existingPhotos &&
				formState.existingPhotos.length > 0
			) {
				formState.existingPhotos.forEach((photo) => {
					images.push(photo.id);
				});
			}

			// Add new photo uploads
			if (formState.photos && formState.photos.length > 0) {
				formState.photos.forEach((photo) => {
					images.push({
						data: photo,
						filename: photo.name,
					});
				});
			}

			const updateData = {
				title: formState.title,
				description: formState.description,
				address: formState.address,
				type: formState.type,
				price: formState.type === "sale" ? formState.price : undefined,
				rental_price:
					formState.type === "rent"
						? formState.rental_price
						: undefined,
				rental_period:
					formState.type === "rent"
						? formState.rental_period
						: undefined,
				slug: formState.title.toLowerCase().replace(/\s+/g, "-"),
				categories: categories,
				images: images,
				attributeValues: attributeValues,
			};

			// Update the listing using the service
			await listingService.updateListing(listing.documentId, updateData);

			// Success notification and redirect
			toast.success(t("updateSuccess"), {
				description: t("updateSuccessDescription"),
			});
			router.push("/app");
		} catch (error) {
			console.error("Error updating listing:", error);
			toast.error(t("updateError"), {
				description: t("updateErrorDescription"),
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	// Get step status: completed, current, or upcoming
	const getStepStatus = (
		stepId: string,
	): "completed" | "current" | "upcoming" => {
		const stepIndex = steps.findIndex((step) => step.id === stepId);
		const currentIndex = steps.findIndex((step) => step.id === currentStep);

		if (stepIndex < currentIndex) return "completed";
		if (stepIndex === currentIndex) return "current";
		return "upcoming";
	};

	return (
		<div className="min-h-screen bg-background flex flex-col">
			{/* Header */}
			<header className="border-b py-4">
				<div className="container">
					<h1 className="text-2xl font-bold">{t("editListing")}</h1>
				</div>
			</header>

			<div className="flex-grow container py-8">
				<div className="grid grid-cols-1 md:grid-cols-12 gap-8">
					{/* Sidebar */}
					<aside className="md:col-span-3">
						<nav className="space-y-1">
							{steps.map((step) => {
								const status = getStepStatus(step.id);
								return (
									<button
										key={step.id}
										type="button"
										className={cn(
											"flex items-center w-full p-3 rounded-md transition-colors text-left",
											status === "current" &&
												"bg-primary/10 text-primary font-medium",
											status === "completed"
												? "text-muted-foreground"
												: "text-foreground",
											"hover:bg-muted/60",
										)}
										onClick={() => {
											// Only allow navigation to completed steps or current step
											if (status !== "upcoming") {
												setCurrentStep(step.id as Step);
											}
										}}
										disabled={status === "upcoming"}
									>
										<div className="flex items-center justify-center h-8 w-8 rounded-full mr-3 flex-shrink-0 border">
											{status === "completed" ? (
												<Check className="h-4 w-4" />
											) : (
												<span>
													{steps.findIndex(
														(s) => s.id === step.id,
													) + 1}
												</span>
											)}
										</div>
										<span className="flex-grow">
											{step.label}
										</span>
										{status !== "upcoming" && (
											<ChevronRight className="h-4 w-4 text-muted-foreground" />
										)}
									</button>
								);
							})}
						</nav>
					</aside>

					{/* Main content */}
					<main className="md:col-span-9 border rounded-lg p-6 bg-card">
						{currentStep === "details" && (
							<DetailsStep
								formState={formState}
								updateField={updateField}
								onNext={goToNextStep}
							/>
						)}

						{currentStep === "pricing" && (
							<PricingStep
								formState={formState}
								updateField={updateField}
								onNext={goToNextStep}
								onBack={goToPrevStep}
							/>
						)}

						{currentStep === "photos" && (
							<PhotosStep
								formState={formState}
								updateField={updateField}
								onSubmit={handleSubmit}
								onBack={goToPrevStep}
								isSubmitting={isSubmitting}
								submitButtonText={t("updateListing")}
							/>
						)}
					</main>
				</div>
			</div>

			{/* Footer */}
			<footer className="border-t py-6 mt-auto">
				<div className="container text-center text-sm text-muted-foreground">
					<p>
						© {new Date().getFullYear()} i-Diplomat Marketplace. All
						rights reserved.
					</p>
				</div>
			</footer>
		</div>
	);
}
