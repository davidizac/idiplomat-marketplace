"use client";

import { Check, ChevronRight } from "lucide-react";
import { useState } from "react";
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
	title: string;
	description: string;

	// Pricing step
	price: number;
	location: string;
	condition: string;

	// Photos step
	photos: File[];

	[key: string]: any; // Add index signature to allow string indexing
}

export default function ListingForm({ userId }: ListingFormProps) {
	const [currentStep, setCurrentStep] = useState<Step>("details");
	const [formState, setFormState] = useState<FormState>({
		category: "",
		subCategory: "",
		title: "",
		description: "",
		price: 0,
		location: "",
		condition: "",
		photos: [],
	});

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
		if (currentStep === "details") setCurrentStep("pricing");
		else if (currentStep === "pricing") setCurrentStep("photos");
	};

	// Navigate to previous step
	const goToPrevStep = () => {
		if (currentStep === "pricing") setCurrentStep("details");
		else if (currentStep === "photos") setCurrentStep("pricing");
	};

	// Handle submission
	const handleSubmit = async () => {
		// Here you would typically submit the form data to your API
		console.log("Form submitted:", {
			...formState,
			userId,
			// Transform data as needed for the API
			categoryId: formState.category,
			subcategoryId: formState.subCategory,
			locationValue: formState.location,
			conditionValue: formState.condition,
		});

		// In a real implementation, you would use the Strapi API to create a listing:
		// Example:
		// try {
		//   const formData = new FormData();
		//
		//   // Add basic data
		//   formData.append('data.title', formState.title);
		//   formData.append('data.description', formState.description);
		//   formData.append('data.price', formState.price.toString());
		//   formData.append('data.condition', formState.condition);
		//   formData.append('data.location', formState.location);
		//   formData.append('data.slug', formState.title.toLowerCase().replace(/\s+/g, '-'));
		//
		//   // Add categories
		//   formData.append('data.categories[0]', formState.category);
		//   if(formState.subCategory) {
		//     formData.append('data.categories[1]', formState.subCategory);
		//   }
		//
		//   // Add images
		//   formState.photos.forEach((photo, index) => {
		//     formData.append(`files.images`, photo);
		//   });
		//
		//   const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/listings`, {
		//     method: 'POST',
		//     headers: {
		//       'Authorization': `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
		//     },
		//     body: formData
		//   });
		//
		//   if (!response.ok) {
		//     throw new Error('Failed to create listing');
		//   }
		//
		//   // Handle success - redirect to the new listing page or show success message
		// } catch (error) {
		//   console.error('Error creating listing:', error);
		//   // Handle error - show error message
		// }

		// Redirect or show success message
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
