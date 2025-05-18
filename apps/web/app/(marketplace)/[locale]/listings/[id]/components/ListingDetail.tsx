"use client";

import { Button } from "@ui/components/button";
import { Card } from "@ui/components/card";
import { Separator } from "@ui/components/separator";
import { ChevronLeft, ChevronRight, User, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

interface Listing {
	id: string;
	title: string;
	price: number;
	author: string;
	description: string;
	authorEmail: string;
	authorPhone: string;
	images: string[];
	location: string;
	createdAt: Date;
}

interface ListingDetailProps {
	listing: Listing;
}

// Image Gallery Component
function ImageGallery({
	images,
	title,
	selectedImage,
	setSelectedImage,
	onOpenModal,
}: {
	images: string[];
	title: string;
	selectedImage: number;
	setSelectedImage: (index: number) => void;
	onOpenModal: (index: number) => void;
}) {
	return (
		<div className="space-y-6">
			<button
				type="button"
				className="relative aspect-square w-full overflow-hidden rounded-lg border cursor-pointer bg-transparent p-0 block"
				onClick={() => onOpenModal(selectedImage)}
				aria-label="View larger image"
			>
				<Image
					src={images[selectedImage]}
					alt={title}
					fill
					className="object-cover hover:scale-105 transition-transform duration-300"
					sizes="(max-width: 768px) 100vw, 50vw"
					priority
				/>
				<div className="absolute inset-0 bg-black/5 hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
					<p className="text-white bg-black/50 px-4 py-2 rounded-full text-sm font-medium">
						Click to enlarge
					</p>
				</div>
			</button>

			{/* Thumbnail Gallery */}
			<div className="flex space-x-3 overflow-x-auto pb-2">
				{images.map((image, index) => (
					<button
						key={index}
						type="button"
						className={`relative h-24 w-24 overflow-hidden rounded-md border-2 ${
							selectedImage === index
								? "border-primary"
								: "border-muted"
						} hover:opacity-90 transition-opacity`}
						onClick={() => setSelectedImage(index)}
					>
						<Image
							src={image}
							alt={`Thumbnail ${index + 1}`}
							fill
							className="object-cover"
							sizes="96px"
						/>
					</button>
				))}
			</div>
		</div>
	);
}

// Image Modal Component
function ImageModal({
	isOpen,
	onClose,
	images,
	title,
	currentImage,
	onNavigate,
}: {
	isOpen: boolean;
	onClose: () => void;
	images: string[];
	title: string;
	currentImage: number;
	onNavigate: (direction: number) => void;
}) {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
			<div className="relative w-full max-w-6xl h-[80vh]">
				{/* Close button */}
				<button
					type="button"
					onClick={onClose}
					className="absolute top-4 right-4 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
					aria-label="Close image viewer"
				>
					<X className="h-6 w-6" />
				</button>

				{/* Navigation buttons */}
				<button
					type="button"
					onClick={() => onNavigate(-1)}
					className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors"
					aria-label="Previous image"
				>
					<ChevronLeft className="h-6 w-6" />
				</button>
				<button
					type="button"
					onClick={() => onNavigate(1)}
					className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors"
					aria-label="Next image"
				>
					<ChevronRight className="h-6 w-6" />
				</button>

				{/* Main image */}
				<div className="relative w-full h-full">
					<Image
						src={images[currentImage]}
						alt={`Image ${currentImage + 1} of ${title}`}
						fill
						className="object-contain"
						sizes="100vw"
						priority
					/>
				</div>

				{/* Image counter */}
				<div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
					{currentImage + 1} / {images.length}
				</div>
			</div>
		</div>
	);
}

// Listing Info Section Component
function ListingInfo({
	title,
	price,
	author,
	location,
	createdAt,
	authorEmail,
	authorPhone,
	showContact,
	setShowContact,
}: {
	title: string;
	price: number;
	author: string;
	location: string;
	createdAt: Date;
	authorEmail: string;
	authorPhone: string;
	showContact: boolean;
	setShowContact: (value: boolean) => void;
}) {
	return (
		<div className="space-y-8">
			<div className="space-y-3">
				<h1 className="text-3xl font-bold">{title}</h1>
				<p className="text-3xl font-bold text-primary">${price}</p>
			</div>

			<div className="flex items-center space-x-3 p-4 bg-muted/30 rounded-lg">
				<div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center">
					<User className="h-6 w-6 text-secondary-foreground" />
				</div>
				<div>
					<p className="font-medium text-lg">{author}</p>
					<p className="text-sm text-muted-foreground">{location}</p>
				</div>
			</div>

			<Button
				onClick={() => setShowContact(!showContact)}
				className="w-full"
				size="lg"
			>
				CONTACT DETAILS
			</Button>

			{showContact && (
				<Card className="p-6 bg-muted/30 border">
					<h3 className="font-semibold text-lg mb-2">
						Contact Information
					</h3>
					<div className="space-y-2">
						<p className="flex items-center">
							<span className="font-medium w-16">Email:</span>
							<span>{authorEmail}</span>
						</p>
						<p className="flex items-center">
							<span className="font-medium w-16">Phone:</span>
							<span>{authorPhone}</span>
						</p>
					</div>
				</Card>
			)}

			<div className="pt-2">
				<p className="text-sm text-muted-foreground">
					Listed on {createdAt.toLocaleDateString()}
				</p>
			</div>
		</div>
	);
}

// Description Section Component
function DescriptionSection({ description }: { description: string }) {
	return (
		<div className="mb-12">
			<h2 className="text-2xl font-semibold mb-6">Description</h2>
			<div className="prose prose-stone max-w-none dark:prose-invert bg-muted/20 p-6 rounded-lg">
				{description.split("\n\n").map((paragraph, i) => (
					<p key={i} className="mb-4">
						{paragraph}
					</p>
				))}
			</div>
		</div>
	);
}

// Contact Action Component
function ContactAction({ onShowContact }: { onShowContact: () => void }) {
	return (
		<div className="text-center py-12 max-w-2xl mx-auto">
			<h2 className="text-2xl font-semibold mb-6">
				Contact the listing author
			</h2>
			<div className="bg-muted/20 p-8 rounded-lg">
				<Button
					onClick={onShowContact}
					size="lg"
					className="w-full mb-6"
				>
					Show Contact Information
				</Button>
				<p className="text-muted-foreground">
					When contacting the seller, please mention that you found
					this listing on IDiplomat Marketplace.
				</p>
			</div>
		</div>
	);
}

export default function ListingDetail({ listing }: ListingDetailProps) {
	const [selectedImage, setSelectedImage] = useState(0);
	const [showContact, setShowContact] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [modalImage, setModalImage] = useState(0);

	// Handle keyboard navigation in the modal
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (!isModalOpen) return;

			if (e.key === "Escape") {
				setIsModalOpen(false);
			} else if (e.key === "ArrowLeft") {
				navigateImage(-1);
			} else if (e.key === "ArrowRight") {
				navigateImage(1);
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isModalOpen, modalImage]);

	// Open modal with specific image
	const openModal = (index: number) => {
		setModalImage(index);
		setIsModalOpen(true);
	};

	// Navigate to prev/next image
	const navigateImage = (direction: number) => {
		const newIndex =
			(modalImage + direction + listing.images.length) %
			listing.images.length;
		setModalImage(newIndex);
	};

	return (
		<div className="container py-12 px-4 md:px-8">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
				{/* Main Image Section */}
				<ImageGallery
					images={listing.images}
					title={listing.title}
					selectedImage={selectedImage}
					setSelectedImage={setSelectedImage}
					onOpenModal={openModal}
				/>

				{/* Listing Info Section */}
				<ListingInfo
					title={listing.title}
					price={listing.price}
					author={listing.author}
					location={listing.location}
					createdAt={listing.createdAt}
					authorEmail={listing.authorEmail}
					authorPhone={listing.authorPhone}
					showContact={showContact}
					setShowContact={setShowContact}
				/>
			</div>

			{/* Description Section */}
			<DescriptionSection description={listing.description} />

			<Separator className="my-12" />

			{/* Contact Action */}
			<ContactAction onShowContact={() => setShowContact(true)} />

			{/* Image Modal */}
			<ImageModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				images={listing.images}
				title={listing.title}
				currentImage={modalImage}
				onNavigate={navigateImage}
			/>
		</div>
	);
}
