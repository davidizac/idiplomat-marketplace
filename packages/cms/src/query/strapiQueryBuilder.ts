/**
 * StrapiQueryBuilder
 * A fluent interface for building Strapi API queries
 */

import qs from "qs";

/**
 * Branded type for query strings to distinguish from regular strings
 */
export type QueryString = string & { __brand: "QueryString" };

export class StrapiQueryBuilder {
	private _where: Record<string, any> = {};
	private _sort: string[] = [];
	private _pagination: { page?: number; pageSize?: number } = {};
	private _populate: Record<string, any> = {};

	/**
	 * Add a where filter to the query
	 */
	where(filters: Record<string, any>): StrapiQueryBuilder {
		this._where = { ...this._where, ...filters };
		return this;
	}

	/**
	 * Add a sort parameter to the query
	 * @param field Field to sort by, with optional direction (e.g., 'createdAt:desc')
	 */
	sort(field: string): StrapiQueryBuilder {
		this._sort.push(field);
		return this;
	}

	/**
	 * Set pagination parameters
	 * @param page Page number (1-based)
	 * @param pageSize Number of items per page
	 */
	paginate(page: number, pageSize: number): StrapiQueryBuilder {
		this._pagination = { page, pageSize };
		return this;
	}

	/**
	 * Add relations to populate
	 * @param fields Array of field names or object with population config
	 */
	populate(fields: string[] | Record<string, any>): StrapiQueryBuilder {
		if (Array.isArray(fields)) {
			fields.forEach((field) => {
				this._populate[field] = true;
			});
		} else {
			this._populate = { ...this._populate, ...fields };
		}
		return this;
	}

	/**
	 * Build and return the query string
	 */
	build(): QueryString {
		const query: Record<string, any> = {};

		// Add pagination if set
		if (Object.keys(this._pagination).length > 0) {
			query.pagination = this._pagination;
		}

		// Add sorting if set
		if (this._sort.length > 0) {
			query.sort = this._sort;
		}

		// Add filters if set
		if (Object.keys(this._where).length > 0) {
			query.filters = this._where;
		}

		// Add population if set
		if (Object.keys(this._populate).length > 0) {
			query.populate = this._populate;
		}

		// Use encodeValuesOnly to avoid encoding field names
		return qs.stringify(query, { encodeValuesOnly: true }) as QueryString;
	}

	/**
	 * Build a basic query for a listing by ID
	 */
	static forListingById(): StrapiQueryBuilder {
		return new StrapiQueryBuilder().populate({
			categories: {
				populate: ["attributes", "parent"],
			},
			images: true,
			product_attribute_values: {
				populate: ["attribute"],
			},
		});
	}

	/**
	 * Build a query for a listing by slug
	 */
	static forListingBySlug(slug: string): StrapiQueryBuilder {
		return new StrapiQueryBuilder()
			.where({
				slug: {
					$eq: slug,
				},
			})
			.populate({
				categories: {
					populate: ["attributes", "categories", "parent"],
				},
				images: true,
				product_attribute_values: {
					populate: ["attribute"],
				},
			});
	}
}
