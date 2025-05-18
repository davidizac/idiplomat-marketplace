import { Prisma } from "@prisma/client";
import { db } from "../client";

// Import ListingStatus enum
const { ListingStatus } = Prisma;

export async function createListing(data: {
	title: string;
	description: string;
	price: number;
	category: string;
	subCategory?: string;
	condition?: string;
	location?: string;
	userId: string;
	status?: (typeof ListingStatus)[keyof typeof ListingStatus];
	images?: string[];
}) {
	return db.listing.create({
		data,
	});
}

export async function getListingById(id: string) {
	return db.listing.findUnique({
		where: {
			id,
		},
		include: {
			user: {
				select: {
					id: true,
					name: true,
					email: true,
				},
			},
		},
	});
}

export async function getListingsForUser(userId: string) {
	return db.listing.findMany({
		where: {
			userId,
		},
		orderBy: {
			createdAt: "desc",
		},
	});
}

export async function updateListing(
	id: string,
	data: {
		title?: string;
		description?: string;
		price?: number;
		category?: string;
		subCategory?: string;
		condition?: string;
		location?: string;
		status?: (typeof ListingStatus)[keyof typeof ListingStatus];
		images?: string[];
	},
) {
	return db.listing.update({
		where: {
			id,
		},
		data,
	});
}

export async function deleteListing(id: string) {
	return db.listing.delete({
		where: {
			id,
		},
	});
}

export async function getAllListings(params?: {
	status?: (typeof ListingStatus)[keyof typeof ListingStatus];
	category?: string;
	subCategory?: string;
	condition?: string;
	minPrice?: number;
	maxPrice?: number;
	limit?: number;
	offset?: number;
}) {
	const {
		status = ListingStatus.ACTIVE,
		category,
		subCategory,
		condition,
		minPrice,
		maxPrice,
		limit = 20,
		offset = 0,
	} = params || {};

	const where: any = { status };

	if (category) {
		where.category = category;
	}

	if (subCategory) {
		where.subCategory = subCategory;
	}

	if (condition) {
		where.condition = condition;
	}

	if (minPrice !== undefined || maxPrice !== undefined) {
		where.price = {};

		if (minPrice !== undefined) {
			where.price.gte = minPrice;
		}

		if (maxPrice !== undefined) {
			where.price.lte = maxPrice;
		}
	}

	return db.listing.findMany({
		where,
		orderBy: {
			createdAt: "desc",
		},
		take: limit,
		skip: offset,
		include: {
			user: {
				select: {
					id: true,
					name: true,
				},
			},
		},
	});
}
