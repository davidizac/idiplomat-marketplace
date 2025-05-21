"use client";
import { strapiClient } from "@repo/cms/clients";
import { Check, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import DetailsStep from "./steps/DetailsStep";
import PhotosStep from "./steps/PhotosStep";
import PricingStep from "./steps/PricingStep";

// Import the cn utility from our own utils folder
function cn(...classes: (string | boolean | undefined)[]) {
	return classes.filter(Boolean).join(" ");
}

interface ListingFormProps {
	userId: string;
}

type Step = "details" | "pricing" | "photos";

interface FormState {
	// Details step
	category: string;
	subCategory: string;
	categoryId: string;
	subCategoryId: string;
	title: string;
	description: string;

	// Photos step
	photos: File[];

	// Attributes
	attributes: Array<{
		attributeId: number;
		attributeName: string;
		value: string;
	}>;

	[key: string]: any; // Add index signature to allow string indexing
}

export default function ListingForm({ userId }: ListingFormProps) {
	const [currentStep, setCurrentStep] = useState<Step>("details");
	const [formState, setFormState] = useState<FormState>({
		category: "",
		subCategory: "",
		categoryId: "",
		subCategoryId: "",
		title: "",
		description: "",
		price: 0,
		photos: [],
		attributes: [],
	});
	const router = useRouter();

	const steps = [
		{ id: "details", label: "Listing Details" },
		{ id: "pricing", label: "Pricing" },
		{ id: "photos", label: "Photos" },
	];

	// Update form field
	const updateField = (field: string, value: any) => {
		setFormState((prev) => ({ ...prev, [field]: value }));
	};

	// Navigate to next step
	const goToNextStep = () => {
		console.log("goToNextStep called, current step:", currentStep);

		if (currentStep === "details") {
			console.log("Moving from details to pricing...");
			setCurrentStep("pricing");
		} else if (currentStep === "pricing") {
			console.log("Moving from pricing to photos...");
			setCurrentStep("photos");
		}
	};

	// Navigate to previous step
	const goToPrevStep = () => {
		console.log("goToPrevStep called, current step:", currentStep);

		if (currentStep === "pricing") {
			console.log("Moving from pricing to details...");
			setCurrentStep("details");
		} else if (currentStep === "photos") {
			console.log("Moving from photos to pricing...");
			setCurrentStep("pricing");
		}
	};

	const handleSubmit = async () => {
		try {
			// 1. Create product attribute values (if needed)
			// For each attribute, POST to /product-attribute-values and collect the IDs
			const productAttributeValueIds: number[] = [];
			for (const attr of formState.attributes) {
				// Prepare the data for the attribute value
				const attributeValueData = {
					attribute: attr.attributeId, // relation by ID
					value: attr.value,
				};

				// Create the attribute value entry
				const res = await strapiClient.post(
					"/product-attribute-values",
					attributeValueData,
				);
				// Collect the created ID
				productAttributeValueIds.push(res.data.id);
			}

			// 2. Prepare categories array
			const categories: number[] = [];
			if (formState.categoryId)
				categories.push(Number(formState.categoryId));
			if (formState.subCategoryId)
				categories.push(Number(formState.subCategoryId));

			// 3. Create the listing entry (without images)
			const listingData = {
				title: formState.title,
				description: formState.description,
				slug: formState.title.toLowerCase().replace(/\s+/g, "-"),
				categories,
				product_attribute_values: productAttributeValueIds,
			};

			const response = await strapiClient.post("/listings", listingData);
			const createdListingId = response.data.id;

			// 4. Upload images and link to the listing
			if (formState.photos.length > 0) {
				const formData = new FormData();
				formData.append("ref", "api::listing.listing");
				formData.append("refId", createdListingId.toString());
				formData.append("field", "images");
				formState.photos.forEach((photo) => {
					formData.append("files", photo);
				});

				await fetch(
					`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/upload`,
					{
						method: "POST",
						headers: {
							Authorization: `Bearer ${process.env.STRAPI_TOKEN}`,
						},
						body: formData,
					},
				);
			}

			// Success notification and redirect
			toast.success("Listing published successfully", {
				description:
					"Your listing has been published to the marketplace.",
			});
			router.push("/app/my-listings");
		} catch (error) {
			console.error("Error creating listing:", error);
			toast.error("Failed to publish listing", {
				description:
					"There was an error publishing your listing. Please try again.",
			});
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
					<h1 className="text-2xl font-bold">Post a Listing</h1>
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
							/>
						)}
					</main>
				</div>
			</div>

			{/* Footer */}
			<footer className="border-t py-6 mt-auto">
				<div className="container text-center text-sm text-muted-foreground">
					<p>
						© {new Date().getFullYear()} IDiplomat Marketplace. All
						rights reserved.
					</p>
				</div>
			</footer>
		</div>
	);
}
