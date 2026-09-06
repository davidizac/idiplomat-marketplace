"use client";

import {
	type AttributeValue,
	type Category,
	type Listing,
	type Image as StrapiImage,
	getStrapiImageUrl,
} from "@repo/cms";
import { Badge } from "@ui/components/badge";
import { Button } from "@ui/components/button";
import { Card } from "@ui/components/card";
import { Check, ChevronLeft, ChevronRight, Mail, MessageCircle, Phone, Tag, User, X } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import {
	formatListingDate,
	formatShekels,
	isDateLikeAttribute,
} from "@marketplace/listings/lib/format";

const IDIPLOMAT_EMAIL = "info@i-diplomat.com";
const IDIPLOMAT_PHONE_DISPLAY = "+972-3-562-2061";
const IDIPLOMAT_PHONE_TEL = "+97235622061";
const IDIPLOMAT_WHATSAPP = "https://wa.me/97235622061";

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
	images: StrapiImage[];
	title: string;
	selectedImage: number;
	setSelectedImage: (index: number) => void;
	onOpenModal: (index: number) => void;
}) {
	const t = useTranslations("marketplace.listing");
	return (
		<div className="space-y-6">
			<button
				type="button"
				className="relative aspect-square w-full overflow-hidden rounded-lg border cursor-pointer bg-transparent p-0 block"
				onClick={() => onOpenModal(selectedImage)}
				aria-label={t("listingImage")}
			>
				<Image
					src={getStrapiImageUrl(images[selectedImage].url)}
					alt={t("listingImage")}
					fill
					className="object-cover hover:scale-105 transition-transform duration-300"
					sizes="(max-width: 768px) 100vw, 50vw"
				/>
				<div className="absolute inset-0 bg-black/5 hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
					<p className="text-white bg-black/50 px-4 py-2 rounded-full text-sm font-medium">
						{t("clickToEnlarge")}
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
						<img
							src={getStrapiImageUrl(image.url)}
							alt={t("imageCounter", { current: index + 1, total: images.length })}
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
	images: StrapiImage[];
	title: string;
	currentImage: number;
	onNavigate: (direction: number) => void;
}) {
	const t = useTranslations("marketplace.listing");
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
			<div className="relative w-full max-w-6xl h-[80vh]">
				{/* Close button */}
				<button
					type="button"
					onClick={onClose}
					className="absolute top-4 right-4 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
					aria-label={t("closeImageViewer")}
				>
					<X className="h-6 w-6" />
				</button>

				{/* Navigation buttons */}
				<button
					type="button"
					onClick={() => onNavigate(-1)}
					className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors"
					aria-label={t("previousImage")}
				>
					<ChevronLeft className="h-6 w-6" />
				</button>
				<button
					type="button"
					onClick={() => onNavigate(1)}
					className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors"
					aria-label={t("nextImage")}
				>
					<ChevronRight className="h-6 w-6" />
				</button>

				{/* Main image */}
				<div className="relative w-full h-full">
					<img
						src={getStrapiImageUrl(images[currentImage].url)}
						alt={t("listingImage")}
						className="object-contain"
						sizes="100vw"
					/>
				</div>

				{/* Image counter */}
				<div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
					{t("imageCounter", { current: currentImage + 1, total: images.length })}
				</div>
			</div>
		</div>
	);
}

// Attribute Value Component
function AttributeValueDisplay({ value }: { value: string }) {
	const normalizedValue = value.toLowerCase();

	if (normalizedValue === "true" || normalizedValue === "yes") {
		return <Check className="h-4 w-4 text-green-600" />;
	}

	if (normalizedValue === "false" || normalizedValue === "no") {
		return <X className="h-4 w-4 text-red-600" />;
	}

	if (isDateLikeAttribute(value)) {
		return <span>{formatListingDate(value)}</span>;
	}

	return <span>{value}</span>;
}

// Categories and Attributes Component
function CategoriesAttributes({
	categories,
	attributes,
}: {
	categories: Category[];
	attributes: AttributeValue[];
}) {
	const t = useTranslations("marketplace.listing");
	if (categories.length === 0 && attributes.length === 0) {
		return null;
	}

	return (
		<div className="mb-8">
			<h2 className="text-2xl font-semibold mb-4">{t("details")}</h2>
			<div className="bg-muted/20 p-6 rounded-lg space-y-6">
				{/* Categories */}
				{categories.length > 0 && (
					<div>
						<h3 className="font-medium mb-3 flex items-center">
							<Tag className="h-4 w-4 mr-2" />
							{t("categories")}
						</h3>
						<div className="flex flex-wrap gap-2">
							{categories.map((category) => (
								<Badge key={category.id} variant="secondary">
									{category.name}
								</Badge>
							))}
						</div>
					</div>
				)}

				{/* Attributes */}
				{attributes.length > 0 && (
					<div>
						<h3 className="font-medium mb-3">{t("specifications")}</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
							{attributes.map((attr) => (
								<div
									key={attr.id}
									className="flex justify-between border-b border-border pb-2"
								>
									<span className="text-muted-foreground">
										{attr.attribute.name}
									</span>
									<span className="font-medium flex items-center">
										<AttributeValueDisplay
											value={attr.value}
										/>
									</span>
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

function ListingInfo({
	title,
	type,
	price,
	rental_price,
	rental_period,
	author,
	address,
	createdAt,
}: {
	title: string;
	type: "rent" | "sale" | "free";
	price?: number;
	rental_price?: number;
	rental_period?: "hourly" | "daily" | "weekly" | "monthly";
	author: string | undefined;
	address: string;
	createdAt: string | Date;
}) {
	const t = useTranslations("marketplace.listing");
	const formatPrice = () => {
		if (type === "free") {
			return t("free");
		}
		if (type === "sale" && price) {
			return formatShekels(price);
		}
		if (type === "rent" && rental_price && rental_period) {
			const periodMap = {
				hourly: t("perHour"),
				daily: t("perDay"),
				weekly: t("perWeek"),
				monthly: t("perMonth"),
			};
			return `${formatShekels(rental_price)} ${periodMap[rental_period]}`;
		}
		return t("priceNotSet");
	};
	const displayAuthor =
		author && !/^[a-zA-Z0-9]{20,}$/.test(author)
			? author
			: t("listingOwner");

	return (
		<div className="space-y-8">
			<div className="space-y-3">
				<h1 className="text-3xl font-bold">{title}</h1>
				<p className="text-3xl font-bold text-primary">
					{formatPrice()}
				</p>
			</div>

			<div className="flex items-center space-x-3 p-4 bg-muted/30 rounded-lg">
				<div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center">
					<User className="h-6 w-6 text-secondary-foreground" />
				</div>
				<div>
					<p className="font-medium text-lg">{displayAuthor}</p>
					<p className="text-sm text-muted-foreground">{address}</p>
				</div>
			</div>

			<Button asChild className="w-full" size="lg">
				<a href={IDIPLOMAT_WHATSAPP} target="_blank" rel="noreferrer">
					<MessageCircle className="mr-2 h-4 w-4" />
					{t("whatsapp")}
				</a>
			</Button>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
				<Button asChild variant="outline" size="lg">
					<a href={`tel:${IDIPLOMAT_PHONE_TEL}`}>
						<Phone className="mr-2 h-4 w-4" />
						{t("call")}
					</a>
				</Button>
				<Button asChild variant="outline" size="lg">
					<a href={`mailto:${IDIPLOMAT_EMAIL}?subject=${encodeURIComponent(`Listing: ${title}`)}`}>
						<Mail className="mr-2 h-4 w-4" />
						{t("emailUs")}
					</a>
				</Button>
			</div>

			<Card className="p-6 bg-muted/30 border">
				<h3 className="font-semibold text-lg mb-2">
					{t("contactInformation")}
				</h3>
				<p className="text-sm text-muted-foreground mb-3">
					{t("requestIntroHint")}
				</p>
				<p className="text-sm">
					<a className="underline" href={`tel:${IDIPLOMAT_PHONE_TEL}`}>
						{IDIPLOMAT_PHONE_DISPLAY}
					</a>
					{" · "}
					<a className="underline" href={`mailto:${IDIPLOMAT_EMAIL}`}>
						{IDIPLOMAT_EMAIL}
					</a>
				</p>
			</Card>

			<div className="pt-2">
				<p className="text-sm text-muted-foreground">
					{t("listedOn", { date: formatListingDate(createdAt) })}
				</p>
			</div>
		</div>
	);
}

// Description Section Component
function DescriptionSection({ description }: { description: string }) {
	const t = useTranslations("marketplace.listing");
	return (
		<div className="mb-12">
			<h2 className="text-2xl font-semibold mb-6">{t("description")}</h2>
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

export default function ListingDetail({ listing }: ListingDetailProps) {
	const [selectedImage, setSelectedImage] = useState(0);
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
					type={listing.type || "sale"}
					price={listing.price}
					rental_price={listing.rental_price}
					rental_period={listing.rental_period}
					author={listing.author}
					address={listing.address}
					createdAt={listing.createdAt}
				/>
			</div>

			{/* Categories and Attributes Section */}
			<CategoriesAttributes
				categories={listing.categories || []}
				attributes={listing.product_attribute_values || []}
			/>

			{/* Description Section */}
			<DescriptionSection description={listing.description} />

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
