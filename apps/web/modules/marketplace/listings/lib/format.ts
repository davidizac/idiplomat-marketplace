export const PRICE_FILTER_CEILING = 10_000_000;
export const PRICE_RANGE_FILTER_ID = "price_range";
export const UNSET_PRICE_RANGE: [number, number] = [0, 0];

export function isUnsetPriceRange(range: [number, number]): boolean {
	return range[0] <= 0 && range[1] <= 0;
}

export function displayPriceBound(value: number): string {
	return value > 0 && value < PRICE_FILTER_CEILING ? String(value) : "";
}

export function readStoredPriceRange(value: unknown): [number, number] {
	if (Array.isArray(value) && value.length >= 2) {
		const min = Number(value[0]) || 0;
		const max = Number(value[1]) || 0;
		return [
			min,
			max >= PRICE_FILTER_CEILING ? 0 : max,
		];
	}

	if (
		value &&
		typeof value === "object" &&
		"min" in value &&
		"max" in value
	) {
		const { min, max } = value as { min: number; max: number };
		return [min || 0, max >= PRICE_FILTER_CEILING ? 0 : max || 0];
	}

	return UNSET_PRICE_RANGE;
}

export function formatShekels(amount: number): string {
	return new Intl.NumberFormat("en-IL", {
		style: "currency",
		currency: "ILS",
		maximumFractionDigits: 0,
	}).format(amount);
}

export function formatListingDate(value: string | Date): string {
	const date = value instanceof Date ? value : new Date(value);
	if (Number.isNaN(date.getTime())) {
		return String(value);
	}

	return date.toLocaleDateString("en-GB", {
		day: "numeric",
		month: "short",
		year: "numeric",
	});
}

export function isDateLikeAttribute(value: string): boolean {
	return (
		/^\d{4}-\d{2}-\d{2}/.test(value) ||
		/GMT|UTC|Israel (Standard|Daylight) Time/.test(value) ||
		/^\w{3} \w{3} \d{2} \d{4}/.test(value)
	);
}
