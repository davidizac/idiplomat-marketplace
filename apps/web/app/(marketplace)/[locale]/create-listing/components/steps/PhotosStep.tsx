"use client";

import { Button } from "@ui/components/button";
import { Label } from "@ui/components/label";
import { Image as ImageIcon, Upload, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useRef, useState } from "react";

interface FormState {
	photos: File[];
	[key: string]: any;
}

interface PhotosStepProps {
	formState: FormState;
	updateField: (field: string, value: any) => void;
	onSubmit: () => void;
	onBack: () => void;
	isSubmitting?: boolean;
}

export default function PhotosStep({
	formState,
	updateField,
	onSubmit,
	onBack,
	isSubmitting = false,
}: PhotosStepProps) {
	const [error, setError] = useState<string>("");
	const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const MAX_PHOTOS = 5;

	// Create URL previews for the uploaded photos
	const updatePhotoPreviews = useCallback(
		(photos: File[]) => {
			// Revoke any existing object URLs to avoid memory leaks
			photoPreviewUrls.forEach((url) => URL.revokeObjectURL(url));

			// Create new object URLs
			const newUrls = photos.map((file) => URL.createObjectURL(file));
			setPhotoPreviewUrls(newUrls);
		},
		[photoPreviewUrls],
	);

	// Handle photo uploads (append new photos instead of replacing)
	const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (!e.target.files || e.target.files.length === 0) return;

		const selectedFiles = Array.from(e.target.files);

		// Check file types first
		const invalidFiles = selectedFiles.filter(
			(file) => !file.type.startsWith("image/"),
		);
		if (invalidFiles.length > 0) {
			setError("Please upload only image files");
			return;
		}

		// Combine existing photos with the newly selected ones
		let combined = [...formState.photos, ...selectedFiles];

		// If combined exceeds max, trim and show an error
		if (combined.length > MAX_PHOTOS) {
			setError(`You can upload a maximum of ${MAX_PHOTOS} photos`);
			combined = combined.slice(0, MAX_PHOTOS);
		} else {
			setError("");
		}

		updateField("photos", combined);
		updatePhotoPreviews(combined);
	};

	// Trigger file input click
	const handleUploadClick = () => {
		fileInputRef.current?.click();
	};

	// Remove a photo
	const removePhoto = (index: number) => {
		const updatedPhotos = formState.photos.filter((_, i) => i !== index);
		updateField("photos", updatedPhotos);
		updatePhotoPreviews(updatedPhotos);
	};

	// Validate before publishing
	const validateBeforeSubmit = () => {
		if (formState.photos.length === 0) {
			setError("Please upload at least one photo");
			return false;
		}

		setError("");
		return true;
	};

	// Handle publish button click
	const handlePublish = () => {
		console.log("Publish button clicked");
		const isValid = validateBeforeSubmit();
		console.log("Photo validation result:", isValid);
		console.log("Photos:", formState.photos);

		if (isValid) {
			console.log("Calling onSubmit()...");
			onSubmit();
		}
	};

	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<h2 className="text-2xl font-bold">Photos</h2>
				<p className="text-muted-foreground">
					Add up to {MAX_PHOTOS} photos of your item.
				</p>
			</div>

			<div className="bg-muted/30 p-6 rounded-lg space-y-4">
				<div className="text-center">
					<Label htmlFor="photos" className="text-lg font-medium">
						Upload Photos
					</Label>
					<p className="text-muted-foreground text-sm mt-1">
						Clear photos from multiple angles will attract more
						interest
					</p>
				</div>

				<input
					ref={fileInputRef}
					type="file"
					id="photos"
					accept="image/*"
					multiple
					onChange={handlePhotoChange}
					className="hidden"
				/>

				{formState.photos.length === 0 ? (
					<button
						type="button"
						onClick={handleUploadClick}
						className="w-full border-2 border-dashed border-primary/50 rounded-lg p-12 text-center cursor-pointer hover:bg-primary/5 transition-colors"
						aria-label="Upload photos"
					>
						<div className="flex flex-col items-center space-y-2">
							<Upload className="h-10 w-10 text-muted-foreground" />
							<p className="font-medium">
								Click to upload photos
							</p>
							<p className="text-sm text-muted-foreground">
								or drag and drop image files
							</p>
						</div>
					</button>
				) : (
					<div className="space-y-4">
						<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
							{photoPreviewUrls.map((url, index) => (
								<div
									key={index}
									className="relative group aspect-square border rounded-md overflow-hidden bg-background"
								>
									<Image
										src={url}
										alt={`Preview ${index + 1}`}
										fill
										className="object-cover"
									/>
									<button
										type="button"
										onClick={() => removePhoto(index)}
										className="absolute top-1 right-1 bg-black/70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
									>
										<X className="h-4 w-4" />
									</button>
								</div>
							))}

							{formState.photos.length < MAX_PHOTOS && (
								<button
									type="button"
									onClick={handleUploadClick}
									className="flex flex-col items-center justify-center border-2 border-dashed border-primary/50 rounded-md aspect-square text-muted-foreground hover:bg-primary/5 transition-colors"
								>
									<ImageIcon className="h-6 w-6 mb-1" />
									<span className="text-xs">Add More</span>
								</button>
							)}
						</div>

						<p className="text-sm text-center text-muted-foreground">
							{formState.photos.length} of {MAX_PHOTOS} photos
							uploaded
						</p>
					</div>
				)}

				{error && (
					<p className="text-sm text-destructive text-center">
						{error}
					</p>
				)}
			</div>

			<div className="flex justify-between">
				<Button
					type="button"
					variant="outline"
					onClick={onBack}
					disabled={isSubmitting}
				>
					Back to Pricing
				</Button>
				<Button
					type="button"
					onClick={handlePublish}
					disabled={isSubmitting}
				>
					{isSubmitting ? "Publishing..." : "Publish Listing"}
				</Button>
			</div>
		</div>
	);
}
